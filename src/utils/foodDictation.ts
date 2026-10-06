// Speech-to-text mangles food & cooking vocabulary the same way it mangles wine
// names ("sole meunière" → "solomonie", "coq au vin" → "cocoa van"). This nudges the
// common mis-hearings back to the right term. Applied to the MIC's dictated output on
// FOOD surfaces only (the Find A Wine Pairing dish field) — manual typing is untouched.
//
// SAFETY: every pattern is anchored with word boundaries and kept distinctive — a
// phonetic spelling or multi-word phrase STT actually produces that a person would
// never intend literally — so ordinary words aren't mangled. Where a term is normally
// transcribed correctly (e.g. "chicken", "salmon"), only its distinctive mis-hears are
// listed, not the correct spelling.
const FIXES: Array<[RegExp, string]> = [
  // ---- French classics -----------------------------------------------------
  [/\bsol[eo]?[\s-]?m(?:eu|u|o)n?[\s-]?(?:yair|yay|ier|ee|ie|y)\b/gi, 'sole meunière'],
  [/\bm(?:eu|u|o)n[\s-]?(?:yair|yay|ier)\b/gi, 'meunière'],
  [/\bcoc(?:oa|o|k)?[\s-]?(?:oh|au|o)?[\s-]?van\b/gi, 'coq au vin'],
  [/\bb(?:eu|oo|u)f?[\s-]?bor(?:g|goo)?[\s-]?(?:en|in)?[\s-]?yon\b/gi, 'bœuf bourguignon'],
  [/\bbeef[\s-]?bor(?:g|goo)?[\s-]?(?:en|in)?[\s-]?yon\b/gi, 'beef bourguignon'],
  [/\bboo?[\s-]?ya[\s-]?base?\b/gi, 'bouillabaisse'],
  [/\bcass?[\s-]?oo?[\s-]?lay\b/gi, 'cassoulet'],
  [/\brat[\s-]?a[\s-]?too?[\s-]?ee\b/gi, 'ratatouille'],
  [/\bcon[\s-]?fee\b/gi, 'confit'],
  [/\bvel[\s-]?oo?[\s-]?tay\b/gi, 'velouté'],
  [/\bbur+[\s-]?bl(?:o|a)nk?\b/gi, 'beurre blanc'],
  [/\bcrem[\s-]?broo?[\s-]?lay\b/gi, 'crème brûlée'],
  [/\bfr?(?:w|o)ah?[\s-]?grah?\b/gi, 'foie gras'],
  [/\bmee?l?[\s-]?foy\b/gi, 'mille-feuille'],
  [/\bkeesh\b/gi, 'quiche'],
  [/\bshar[\s-]?koo?[\s-]?ter[\s-]?ee\b/gi, 'charcuterie'],
  [/\bpot[\s-]?oh?[\s-]?f(?:ur|oo|eu)\b/gi, 'pot-au-feu'],
  [/\btart[\s-]?ta[\s-]?t(?:a|e)n\b/gi, 'tarte tatin'],
  [/\bsteak[\s-]?oh?[\s-]?pwavr?\b/gi, 'steak au poivre'],
  [/\bduck[\s-]?a[\s-]?l[\s-]?orange\b/gi, "duck à l'orange"],
  [/\bcrew?[\s-]?di[\s-]?tay\b/gi, 'crudités'],
  [/\bai[\s-]?o?[\s-]?lee\b/gi, 'aïoli'],
  [/\beye[\s-]?oh?[\s-]?lee\b/gi, 'aïoli'],
  [/\bra[\s-]?clett?\b/gi, 'raclette'],

  // ---- Italian -------------------------------------------------------------
  [/\bn(?:y|i)o[\s-]?kee\b/gi, 'gnocchi'],
  [/\briz[\s-]?ot+o\b/gi, 'risotto'],
  [/\bbroo?[\s-]?sket+a\b/gi, 'bruschetta'],
  [/\bbur+a?[\s-]?ata\b/gi, 'burrata'],
  [/\bpro[\s-]?shoo?[\s-]?toe?\b/gi, 'prosciutto'],
  [/\bra[\s-]?dee?[\s-]?kee[\s-]?oh\b/gi, 'radicchio'],
  [/\bpoo?[\s-]?tan[\s-]?es[\s-]?ka\b/gi, 'puttanesca'],
  [/\bcar[\s-]?bo[\s-]?nara\b/gi, 'carbonara'],
  [/\bos+o[\s-]?boo?[\s-]?ko\b/gi, 'osso buco'],
  [/\bch?ick[\s-]?pea\b/gi, 'chickpea'],

  // ---- Spanish / Portuguese ------------------------------------------------
  [/\bpie[\s-]?el+a\b/gi, 'paella'],
  [/\bpah?[\s-]?ey[\s-]?ya\b/gi, 'paella'],
  [/\bcho[\s-]?ree?[\s-]?zo\b/gi, 'chorizo'],
  [/\bha[\s-]?mon\b/gi, 'jamón'],
  [/\bga(?:z|s)[\s-]?pa[\s-]?cho\b/gi, 'gazpacho'],
  [/\bse[\s-]?vee[\s-]?chay\b/gi, 'ceviche'],

  // ---- Middle East / N. Africa / Greece ------------------------------------
  [/\bha[\s-]?ree?[\s-]?sa\b/gi, 'harissa'],
  [/\bta[\s-]?jeen\b/gi, 'tagine'],
  [/\bshak[\s-]?shoo?[\s-]?ka\b/gi, 'shakshuka'],
  [/\bta[\s-]?hee?[\s-]?nee\b/gi, 'tahini'],
  [/\bha[\s-]?loo?[\s-]?mee\b/gi, 'halloumi'],
  [/\bbab+a[\s-]?ga[\s-]?noush?\b/gi, 'baba ganoush'],
  [/\bsoo?[\s-]?vla[\s-]?kee\b/gi, 'souvlaki'],
  [/\bspan[\s-]?a[\s-]?ko[\s-]?pita\b/gi, 'spanakopita'],

  // ---- Asian ---------------------------------------------------------------
  [/\bfuh\b/gi, 'pho'],
  [/\bgo[\s-]?choo?[\s-]?jang\b/gi, 'gochujang'],
  [/\bda[\s-]?shee\b/gi, 'dashi'],
  [/\bpon[\s-]?zoo\b/gi, 'ponzu'],
  [/\bmee[\s-]?so\b/gi, 'miso'],
  [/\bbool[\s-]?go[\s-]?gee\b/gi, 'bulgogi'],
  [/\bkim[\s-]?chee\b/gi, 'kimchi'],
  [/\bed[\s-]?a[\s-]?ma[\s-]?may\b/gi, 'edamame'],
  [/\bter[\s-]?ee?[\s-]?ya[\s-]?kee\b/gi, 'teriyaki'],
  [/\brah?[\s-]?men\b/gi, 'ramen'],
  [/\blem+on[\s-]?gras+\b/gi, 'lemongrass'],

  // ---- Techniques / terms --------------------------------------------------
  [/\bsoo?[\s-]?veed\b/gi, 'sous vide'],
  [/\bron?[\s-]?doo\b/gi, 'roux'],
  [/\bjoo\b/gi, 'jus'],
  [/\bbra(?:ze|ised)\b/gi, 'braise'],
  [/\bb(?:lan|lon)ch\b/gi, 'blanch'],
  [/\bem[\s-]?ool?[\s-]?sify\b/gi, 'emulsify'],
  [/\bdeg[\s-]?la[\s-]?za?\b/gi, 'deglaze'],
  [/\bca[\s-]?ram[\s-]?el[\s-]?ize\b/gi, 'caramelise'],

  // ---- Tricky ingredients --------------------------------------------------
  [/\bsha[\s-]?lot\b/gi, 'shallot'],
  [/\ban[\s-]?cho[\s-]?vee\b/gi, 'anchovy'],
  [/\bkay[\s-]?pers?\b/gi, 'capers'],
  [/\bsaf[\s-]?ron\b/gi, 'saffron'],
  [/\btruf+le?\b/gi, 'truffle'],
  [/\bpor[\s-]?chee?[\s-]?nee\b/gi, 'porcini'],
  [/\bshan[\s-]?ter[\s-]?el\b/gi, 'chanterelle'],
  [/\ben[\s-]?deev\b/gi, 'endive'],
  [/\bo[\s-]?ber[\s-]?jeen\b/gi, 'aubergine'],
  [/\bcor[\s-]?jet\b/gi, 'courgette'],
  [/\bfen+el\b/gi, 'fennel'],
  [/\bar[\s-]?ti[\s-]?choke\b/gi, 'artichoke'],
];

// Correct common food/recipe mis-hearings in dictated text. Idempotent-ish and safe
// to run on partial (interim) transcripts.
export function correctFoodTerms(text: string): string {
  let out = text;
  for (const [re, rep] of FIXES) out = out.replace(re, rep);
  return out;
}
