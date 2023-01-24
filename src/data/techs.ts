import reactLogo from "../assets/react.svg";

export type Tech = {
	href: string,
	src: any,
	className: string,
	alt: string,
}

export const TECH_BY_ID: Record <string, Tech> = {
	react: {
		href: 'https://reactjs.org/',
        src: reactLogo,
		className: 'logo react',
		alt: 'React logo',
	},
	vite: {
		href: 'https://vitejs.dev/',
		src: "/vite.svg",
		className: 'logo',
		alt: 'Vite logo',
	},
}