import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { useCommunityMember } from '../../src/hooks/useCommunityMember';
import { supabase } from '../../src/api/supabase';
import { communityImageUrl, getMyCommunityEmail, isMember, joinCommunity, removeCommunityPhoto, setCommunityPhoto } from '../../src/api/community';
import { runAfterJoin } from '../../src/services/communityShare';
import { launchImageLibrary } from '../../src/utils/imagePicker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const GUIDELINES = [
  'Share honest reviews of wines and restaurants.',
  'Be kind to other members. No bullying, hate or harassment.',
  'Keep private details private: no phone numbers, addresses or emails.',
  'No advertising, selling or spam.',
  'Vinster checks shared reviews and comments before they appear, and members can report anything that breaks these guidelines.',
];

// Joining the Vinster Community — and, once a member, editing your Community
// profile (username, email, photo, personality sketch, being found by email).
// Members reach it from You → Your Community Profile (not from Gather).
// Opened by withMembership() before a first share; on joining, the share the
// user started carries on (runAfterJoin).
export default function JoinCommunityScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { member, refreshMember } = useCommunityMember();
  const joined = isMember(member);
  const queryClient = useQueryClient();

  const { data: sketch = null } = useQuery({
    queryKey: ['alter-ego-sketch', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('last_alter_ego_personality').eq('id', userId!).maybeSingle();
      return (data?.last_alter_ego_personality as string | null) ?? null;
    },
  });

  const [username, setUsername] = useState('');
  // The Community email — may differ from the sign-in email; never shown to
  // other members.
  const [email, setEmail] = useState('');
  // Set when the saved email couldn't be read: the save then leaves the
  // stored email alone unless the user typed a new one.
  const [emailLoadFailed, setEmailLoadFailed] = useState(false);
  const [emailEdited, setEmailEdited] = useState(false);
  const { data: savedEmail, isFetched: emailFetched, isError: emailError } = useQuery({
    queryKey: ['community-email', userId],
    enabled: !!userId && joined,
    queryFn: () => getMyCommunityEmail(userId!),
  });
  // Fill the field once per member (not on every refetch / token refresh, which
  // would wipe an edit in progress). The sign-in email is only a first-time
  // default: a Community email the member cleared stays cleared.
  const emailInitFor = useRef<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    if (joined && !emailFetched && !emailError) return;
    const key = `${member?.user_id ?? 'none'}:${joined}`;
    if (emailInitFor.current === key) return;
    emailInitFor.current = key;
    setEmailEdited(false);
    if (joined && emailError && !savedEmail) {
      setEmailLoadFailed(true);
      setEmail('');
    } else if (joined && savedEmail?.exists) {
      setEmailLoadFailed(false);
      setEmail(savedEmail.email ?? '');
    } else {
      setEmailLoadFailed(false);
      setEmail(session?.user.email ?? '');
    }
  }, [userId, joined, emailFetched, emailError, savedEmail, member?.user_id, session?.user.email]);
  const [findable, setFindable] = useState(true);
  const [showSketch, setShowSketch] = useState(true);
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Start from the current membership, else the account's username. Once per
  // member — `member` is a new object on every refetch and `session` on every
  // token refresh, and re-running this wiped edits in progress.
  const didInit = useRef<string | null>(null);
  useEffect(() => {
    const key = member?.user_id ?? 'none';
    if (didInit.current === key) return;
    didInit.current = key;
    if (member) {
      setUsername(member.username);
      setFindable(member.discoverable_by_email);
      setShowSketch(!!member.alter_ego_personality || !joined);
    } else {
      setUsername((session?.user.user_metadata?.display_name ?? '').trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.user_id, session?.user.id]);

  async function pickPhoto() {
    if (!(await ensureMediaPermission('library'))) return;
    const res = await launchImageLibrary({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (res.canceled || !res.assets?.[0]) return;
    const out = await manipulateAsync(res.assets[0].uri, [{ resize: { width: 600 } }], { compress: 0.75, format: SaveFormat.JPEG, base64: true });
    if (out.base64) { setPhoto({ uri: out.uri, base64: out.base64 }); setRemovePhoto(false); }
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      // Leave `email` out when the saved one couldn't be read and wasn't
      // retyped — the server then keeps whatever is stored.
      const trimmedEmail = email.trim();
      const sendEmail = !emailLoadFailed || (emailEdited && !!trimmedEmail);
      await joinCommunity({
        username: username.trim(),
        ...(sendEmail ? { email: trimmedEmail } : {}),
        discoverableByEmail: findable,
        showPersonality: !!sketch && showSketch,
      });
      // Keep the cached email in step, so reopening the screen within the
      // stale window doesn't show (and save back) the old one.
      if (sendEmail && userId) {
        queryClient.setQueryData(['community-email', userId], { exists: true, email: trimmedEmail.toLowerCase() || null });
      }
      // The photo is checked separately; a refused photo doesn't undo joining.
      if (photo) {
        try { await setCommunityPhoto(photo.base64, 'image/jpeg'); }
        catch (err) { showAlert({ title: 'Photo Not Added', body: err instanceof Error ? err.message : 'Please try another photo.' }); }
      } else if (removePhoto && member?.avatar_path) {
        await removeCommunityPhoto();
      }
      refreshMember();
      router.back();
      // Carry on with the share that brought the user here.
      if (!joined) setTimeout(runAfterJoin, 350);
    } catch (err) {
      showAlert({ title: joined ? 'Could Not Save' : 'Could Not Join', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const currentPhoto = photo?.uri ?? (removePhoto ? null : communityImageUrl(member?.avatar_path));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{joined ? 'Your Community Profile' : 'Join the Community'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={40}>
        {!joined && (
          <Text style={styles.intro}>
            Share your wine and restaurant reviews, follow friends and see what other members are drinking.
          </Text>
        )}

        <TouchableOpacity style={styles.photoWrap} onPress={pickPhoto} activeOpacity={0.8}>
          {currentPhoto
            ? <Image source={{ uri: currentPhoto }} style={styles.photo} contentFit="cover" />
            : <View style={[styles.photo, styles.photoEmpty]}><Text style={styles.photoInitial}>{(username.trim()[0] ?? '?').toUpperCase()}</Text></View>}
          <Text style={styles.photoLink}>{currentPhoto ? 'Change photo' : 'Add a photo (optional)'}</Text>
        </TouchableOpacity>
        {currentPhoto && (
          <TouchableOpacity onPress={() => { setPhoto(null); setRemovePhoto(true); }} style={styles.removePhoto}>
            <Text style={styles.removePhotoText}>Remove photo</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.note}>
          Your Community username and email can be different from the username and email you use to sign in to Vinster. Changing them here won't change your Vinster login.
        </Text>

        <Text style={styles.fieldLabel}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={40}
          placeholder="Your username"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.help}>This is how other members will see you.</Text>

        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(t) => { setEmail(t); setEmailEdited(true); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          maxLength={254}
          placeholder={emailLoadFailed ? 'Leave blank to keep your saved email' : 'Your Community email'}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.help}>Never shown to other members. Only used so people who know it can find you, if you allow that below.</Text>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Let people who have my email address find me</Text>
          <Switch value={findable} onValueChange={setFindable} trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }} thumbColor="#FFFFFF" />
        </View>
        {!!sketch && (
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show my Vinster Alter-Ego on my profile</Text>
            <Switch value={showSketch} onValueChange={setShowSketch} trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }} thumbColor="#FFFFFF" />
          </View>
        )}

        {!joined && (
          <>
            <View style={styles.divider} />
            <Text style={styles.blockHeading}>Community Guidelines</Text>
            {GUIDELINES.map((g) => (
              <View key={g} style={styles.bulletRow}>
                <Text style={styles.bullet}>·</Text>
                <Text style={styles.bulletText}>{g}</Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={[styles.joinBtn, (!username.trim() || saving) && styles.joinBtnOff]} onPress={save} disabled={!username.trim() || saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.joinBtnText}>{joined ? 'Save' : 'Agree and Join'}</Text>}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.8, textAlign: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 80 },
  intro: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  photoWrap: { alignItems: 'center', gap: spacing.sm },
  photo: { width: 96, height: 96, borderRadius: 48 },
  photoEmpty: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  photoInitial: { fontSize: 38, fontFamily: fonts.headingBold, color: colors.gold },
  photoLink: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold },
  removePhoto: { alignSelf: 'center', marginTop: 4 },
  removePhotoText: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  note: { marginTop: spacing.lg, fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', lineHeight: 20 },
  fieldLabel: { marginTop: spacing.lg, fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { marginTop: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 10, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  help: { marginTop: 4, fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 6 },
  toggleLabel: { flex: 1, fontSize: 15, fontFamily: fonts.bodyItalic, color: '#FFFFFF', lineHeight: 20 },
  blockHeading: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 6 },
  bullet: { fontSize: 15, fontFamily: fonts.bodyBold, color: colors.gold, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 20 },
  joinBtn: { marginTop: spacing.xl, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  joinBtnOff: { opacity: 0.5 },
  joinBtnText: { fontSize: 16, fontFamily: fonts.headingBold, color: colors.gold, letterSpacing: 0.5 },
});
