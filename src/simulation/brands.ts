export const BRANDS = [
	'Tecate',
	'Dos Equis',
	'Indio',
	'Bohemia',
	'Sol',
	'Carta Blanca',
	'Superior',
	'Amstel Ultra',
	'Heineken',
	'Coors',
	'Miller',
] as const;

export type BrandName = (typeof BRANDS)[number];
export const UNIDENTIFIED = 'No identificada';