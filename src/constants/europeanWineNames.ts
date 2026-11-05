// German, Spanish and Italian wine names Vinster should always "hear" correctly
// when dictated — regions & appellations, famous vineyards / crus, quality terms,
// grapes and the producers people name most. Fed to the sound-alike corrector
// (src/utils/soundAlike.ts) with the Burgundy list and the user's own wines.

const GERMANY = [
  // Regions
  'Mosel', 'Saar', 'Ruwer', 'Rheingau', 'Rheinhessen', 'Pfalz', 'Nahe', 'Franken', 'Baden', 'Württemberg', 'Ahr',
  'Mittelrhein', 'Saale-Unstrut', 'Sachsen', 'Hessische Bergstraße',
  // Famous vineyards (Mosel / Saar / Ruwer)
  'Wehlener Sonnenuhr', 'Graacher Himmelreich', 'Graacher Domprobst', 'Bernkasteler Doctor', 'Ürziger Würzgarten',
  'Erdener Treppchen', 'Erdener Prälat', 'Brauneberger Juffer', 'Brauneberger Juffer-Sonnenuhr', 'Piesporter Goldtröpfchen',
  'Zeltinger Sonnenuhr', 'Scharzhofberger', 'Scharzhofberg', 'Wiltinger Braunfels', 'Ockfener Bockstein', 'Saarburger Rausch',
  'Kanzemer Altenberg', 'Trittenheimer Apotheke', 'Kaseler Nies\'chen', 'Eitelsbacher Karthäuserhofberg', 'Abtsberg',
  'Bockstein', 'Kupp', 'Layet', 'Uhlen', 'Winninger Uhlen', 'Röttgen', 'Ayler Kupp', 'Schodener Saarfeilser',
  // Nahe / Rheingau / Rheinhessen / Pfalz / Franken
  'Niederhäuser Hermannshöhle', 'Hermannshöhle', 'Felsenberg', 'Kupfergrube', 'Dellchen', 'Halenberg', 'Frühlingsplätzchen',
  'Rüdesheimer Berg Schlossberg', 'Berg Schlossberg', 'Berg Rottland', 'Erbacher Marcobrunn', 'Marcobrunn',
  'Kiedricher Gräfenberg', 'Gräfenberg', 'Hochheimer Hölle', 'Schloss Johannisberg', 'Steinberg', 'Baiken', 'Doosberg',
  'Nierstein', 'Pettenthal', 'Hipping', 'Brudersberg', 'Rothenberg', 'Morstein', 'Kirchspiel', 'Brunnenhäuschen',
  'Hubacker', 'Aulerde', 'Forster Kirchenstück', 'Kirchenstück', 'Jesuitengarten', 'Pechstein', 'Ungeheuer',
  'Idig', 'Kastanienbusch', 'Saumagen', 'Kalmit', 'Würzburger Stein', 'Pfülben', 'Julius-Echter-Berg',
  // Quality terms & styles
  'Kabinett', 'Spätlese', 'Auslese', 'Beerenauslese', 'Trockenbeerenauslese', 'Eiswein', 'Großes Gewächs',
  'Grosses Gewächs', 'Erste Lage', 'Große Lage', 'Grosse Lage', 'Trocken', 'Feinherb', 'Halbtrocken', 'Sekt',
  'Prädikatswein', 'Goldkapsel', 'Lange Goldkapsel',
  // Grapes
  'Riesling', 'Spätburgunder', 'Frühburgunder', 'Silvaner', 'Weissburgunder', 'Grauburgunder', 'Lemberger',
  'Müller-Thurgau', 'Scheurebe', 'Dornfelder', 'Trollinger', 'Gewürztraminer',
  // Producers
  'Egon Müller', 'J.J. Prüm', 'Joh. Jos. Prüm', 'Dönnhoff', 'Keller', 'Klaus Peter Keller', 'Wittmann', 'Robert Weil',
  'Fritz Haag', 'Willi Schaefer', 'Maximin Grünhaus', 'von Schubert', 'Zilliken', 'Markus Molitor', 'Schloss Lieser',
  'Dr. Loosen', 'Selbach-Oster', 'Clemens Busch', 'Emrich-Schönleber', 'Schäfer-Fröhlich', 'Künstler', 'Leitz',
  'Bürklin-Wolf', 'von Winning', 'Ökonomierat Rebholz', 'Rebholz', 'Knipser', 'Friedrich Becker', 'Bernhard Huber',
  'Dr. Heger', 'Rudolf Fürst', 'Fürst', 'Van Volxem', 'Peter Lauer', 'Battenfeld-Spanier', 'Peter Jakob Kühn',
  'Georg Breuer', 'Gunderloch', 'Schlossgut Diel', 'Karthäuserhof', 'Heymann-Löwenstein', 'Grans-Fassian',
  'Carl Loewen', 'Reinhold Haart', 'Julian Haart', 'Sankt Urbans-Hof', 'A.J. Adam', 'Weiser-Künstler', 'Horst Sauer',
  'Schmitt\'s Kinder', 'Kühling-Gillot', 'Schloss Johannisberg', 'Hofgut Falkenstein', 'Vollenweider', 'Ziereisen',
];

const SPAIN = [
  // Regions & DOs
  'Rioja', 'Rioja Alta', 'Rioja Alavesa', 'Rioja Oriental', 'Ribera del Duero', 'Priorat', 'Montsant', 'Toro', 'Rueda',
  'Rías Baixas', 'Bierzo', 'Ribeira Sacra', 'Valdeorras', 'Jumilla', 'Yecla', 'Navarra', 'Penedès', 'Cava', 'Corpinnat',
  'Jerez', 'Jerez-Xérès-Sherry', 'Sherry', 'Manzanilla', 'Sanlúcar de Barrameda', 'El Puerto de Santa María',
  'Montilla-Moriles', 'Málaga', 'Calatayud', 'Campo de Borja', 'Cariñena', 'Somontano', 'Terra Alta', 'Txakoli',
  'Getariako Txakolina', 'Valdepeñas', 'La Mancha', 'Utiel-Requena', 'Alicante', 'Tenerife', 'Canarias', 'Lanzarote',
  'Valle de la Orotava', 'Gredos', 'Sierra de Gredos', 'Méntrida', 'Cebreros', 'Arribes', 'Cigales', 'Empordà',
  // Sherry styles & terms
  'Fino', 'Amontillado', 'Oloroso', 'Palo Cortado', 'Pedro Ximénez', 'En Rama', 'Solera', 'Crianza', 'Reserva',
  'Gran Reserva', 'Joven', 'Vino de Pago', 'Vino de Paraje', 'Viñedo Singular',
  // Grapes
  'Tempranillo', 'Tinto Fino', 'Tinta de Toro', 'Garnacha', 'Garnatxa', 'Graciano', 'Mazuelo', 'Monastrell', 'Mencía',
  'Albariño', 'Verdejo', 'Godello', 'Viura', 'Macabeo', 'Xarel·lo', 'Parellada', 'Cariñena', 'Samsó', 'Palomino',
  'Bobal', 'Hondarrabi Zuri', 'Listán Negro', 'Listán Blanco', 'Treixadura', 'Caíño', 'Prieto Picudo',
  // Producers & famous wines
  'Vega Sicilia', 'Vega Sicilia Único', 'Valbuena', 'Pingus', 'Flor de Pingus', 'Dominio de Pingus', 'Alión', 'Pesquera',
  'Aalto', 'Mauro', 'Abadía Retuerta', 'Emilio Moro', 'Teso La Monja', 'Numanthia', 'Pintia', 'Dominio del Águila',
  'López de Heredia', 'Viña Tondonia', 'Viña Bosconia', 'La Rioja Alta', 'Gran Reserva 904', 'Gran Reserva 890',
  'Viña Ardanza', 'Muga', 'Prado Enea', 'Torre Muga', 'CVNE', 'Cune', 'Imperial', 'Viña Real', 'Contino',
  'Marqués de Murrieta', 'Castillo Ygay', 'Marqués de Riscal', 'Remírez de Ganuza', 'Artadi', 'Benjamín Romeo',
  'Contador', 'Roda', 'Cirsion', 'Sierra Cantabria', 'Telmo Rodríguez', 'Álvaro Palacios', 'L\'Ermita', 'Finca Dofí',
  'Clos Mogador', 'Clos Erasmus', 'Mas Doix', 'Terroir al Límit', 'Descendientes de J. Palacios', 'La Faraona',
  'Raúl Pérez', 'Envínate', 'Comando G', 'Rafael Palacios', 'As Sortes', 'Do Ferreiro', 'Pazo de Señorans', 'Zárate',
  'Equipo Navazos', 'Tío Pepe', 'González Byass', 'Lustau', 'Valdespino', 'Hidalgo La Gitana', 'Barbadillo',
  'Fernando de Castilla', 'Bodegas Tradición', 'Recaredo', 'Gramona', 'Torres', 'Mas La Plana', 'Juvé & Camps',
];

const ITALY = [
  // Piedmont
  'Barolo', 'Barbaresco', 'Langhe', 'Langhe Nebbiolo', 'Roero', 'Gattinara', 'Ghemme', 'Boca', 'Lessona', 'Carema',
  'Barbera d\'Asti', 'Barbera d\'Alba', 'Nizza', 'Dolcetto d\'Alba', 'Dogliani', 'Nebbiolo d\'Alba', 'Moscato d\'Asti',
  'Asti Spumante', 'Gavi', 'Gavi di Gavi', 'Roero Arneis', 'Timorasso', 'Derthona', 'Ruchè', 'Grignolino', 'Freisa',
  // Barolo communes & MGAs
  'La Morra', 'Serralunga d\'Alba', 'Monforte d\'Alba', 'Castiglione Falletto', 'Verduno', 'Novello', 'Grinzane Cavour',
  'Cannubi', 'Brunate', 'Cerequio', 'Rocche dell\'Annunziata', 'Bussia', 'Ginestra', 'Ravera', 'Monprivato', 'Villero',
  'Falletto', 'Vigna Rionda', 'Lazzarito', 'Francia', 'Cascina Francia', 'Bricco Boschis', 'Rocche di Castiglione',
  'Monvigliero', 'Arborina', 'Rocche dell\'Annunziata', 'Le Coste', 'Sarmassa', 'Fiasco', 'Parussi', 'Mosconi',
  // Barbaresco crus
  'Asili', 'Rabajà', 'Martinenga', 'Montestefano', 'Pajè', 'Ovello', 'Montefico', 'Santo Stefano', 'Pora', 'Muncagota',
  'Sorì San Lorenzo', 'Sorì Tildin', 'Costa Russi', 'Starderi', 'Gallina', 'Albesani', 'Serraboella',
  // Tuscany
  'Chianti', 'Chianti Classico', 'Chianti Rufina', 'Gran Selezione', 'Brunello di Montalcino', 'Brunello', 'Montalcino',
  'Rosso di Montalcino', 'Vino Nobile di Montepulciano', 'Rosso di Montepulciano', 'Bolgheri', 'Bolgheri Sassicaia',
  'Morellino di Scansano', 'Carmignano', 'Vernaccia di San Gimignano', 'Montecucco', 'Maremma', 'Super Tuscan', 'Vin Santo',
  'Radda', 'Gaiole', 'Castellina', 'Greve', 'Panzano', 'Castelnuovo Berardenga',
  // Veneto / Friuli / Alto Adige / Trentino / Lombardy
  'Amarone della Valpolicella', 'Amarone', 'Valpolicella', 'Valpolicella Ripasso', 'Ripasso', 'Recioto', 'Soave',
  'Soave Classico', 'Prosecco', 'Valdobbiadene', 'Conegliano', 'Cartizze', 'Bardolino', 'Lugana', 'Custoza',
  'Collio', 'Friuli Colli Orientali', 'Friuli', 'Ribolla Gialla', 'Friulano', 'Alto Adige', 'Südtirol', 'Trentino',
  'Trento DOC', 'Franciacorta', 'Valtellina', 'Valtellina Superiore', 'Sforzato', 'Sfursat', 'Sassella', 'Grumello',
  'Inferno', 'Valgella', 'Oltrepò Pavese',
  // Centre & south
  'Verdicchio dei Castelli di Jesi', 'Verdicchio di Matelica', 'Rosso Conero', 'Montepulciano d\'Abruzzo',
  'Trebbiano d\'Abruzzo', 'Cerasuolo d\'Abruzzo', 'Taurasi', 'Fiano di Avellino', 'Greco di Tufo', 'Falanghina',
  'Aglianico del Vulture', 'Primitivo di Manduria', 'Salice Salentino', 'Castel del Monte', 'Etna', 'Etna Rosso',
  'Etna Bianco', 'Cerasuolo di Vittoria', 'Marsala', 'Pantelleria', 'Passito di Pantelleria', 'Faro', 'Cannonau di Sardegna',
  'Vermentino di Gallura', 'Carignano del Sulcis', 'Sagrantino di Montefalco', 'Montefalco', 'Orvieto', 'Lambrusco',
  'Lambrusco di Sorbara', 'Sangiovese di Romagna', 'Cirò', 'Lacryma Christi',
  // Grapes & terms
  'Nebbiolo', 'Sangiovese', 'Sangiovese Grosso', 'Barbera', 'Dolcetto', 'Corvina', 'Corvinone', 'Rondinella', 'Glera',
  'Montepulciano', 'Aglianico', 'Nerello Mascalese', 'Nerello Cappuccio', 'Nero d\'Avola', 'Frappato', 'Carricante',
  'Primitivo', 'Negroamaro', 'Vermentino', 'Fiano', 'Greco', 'Garganega', 'Pinot Grigio', 'Teroldego', 'Lagrein',
  'Schiava', 'Sagrantino', 'Grillo', 'Catarratto', 'Vernaccia', 'Cortese', 'Arneis', 'Moscato', 'Pecorino', 'Gaglioppo',
  'Riserva', 'Superiore', 'Classico', 'DOCG', 'Passito', 'Spumante', 'Frizzante', 'Metodo Classico', 'Vigna',
  // Producers & famous wines
  'Giacomo Conterno', 'Monfortino', 'Bartolo Mascarello', 'Giuseppe Mascarello', 'Giuseppe Rinaldi', 'Bruno Giacosa',
  'Gaja', 'Roagna', 'Produttori del Barbaresco', 'Vietti', 'Elio Altare', 'Roberto Voerzio', 'Paolo Scavino',
  'Luciano Sandrone', 'Cavallotto', 'G.B. Burlotto', 'Burlotto', 'G.D. Vajra', 'Vajra', 'Brovia', 'Bruno Rocca',
  'Sottimano', 'Giuseppe Quintarelli', 'Quintarelli', 'Dal Forno Romano', 'Bertani', 'Allegrini', 'Masi', 'Zenato',
  'Tommaso Bussola', 'Sassicaia', 'Tenuta San Guido', 'Ornellaia', 'Masseto', 'Tignanello', 'Solaia', 'Antinori',
  'Biondi-Santi', 'Soldera', 'Case Basse', 'Poggio di Sotto', 'Il Poggione', 'Casanova di Neri', 'Salvioni',
  'Cerbaiona', 'Le Macioche', 'Fontodi', 'Flaccianello', 'Isole e Olena', 'Fèlsina', 'Castello di Ama', 'Montevertine',
  'Le Pergole Torte', 'Querciabella', 'Badia a Coltibuono', 'Frescobaldi', 'Castello di Brolio', 'Ricasoli',
  'Le Macchiole', 'Tua Rita', 'Redigaffi', 'Grattamacco', 'Mastroberardino', 'Feudi di San Gregorio', 'Benanti',
  'Passopisciaro', 'Frank Cornelissen', 'Tenuta delle Terre Nere', 'COS', 'Arianna Occhipinti', 'Planeta', 'Donnafugata',
  'Valentini', 'Emidio Pepe', 'Gravner', 'Radikon', 'Jermann', 'Livio Felluga', 'Ca\' del Bosco', 'Bellavista',
  'Nino Negri', 'Ar.Pe.Pe.', 'Foradori', 'Elena Walch', 'Terlano', 'Cantina Terlano', 'Paolo Bea', 'Arnaldo Caprai',
];

export const EUROPEAN_WINE_NAMES: string[] = Array.from(new Set([...GERMANY, ...SPAIN, ...ITALY]));
