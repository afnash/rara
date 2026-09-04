import type{Metadata}from'next';import'./globals.css';import'./dashboard.css';
export const metadata:Metadata={title:'RaRa Pet Care',description:'Trusted, personal pet care across Singapore'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
