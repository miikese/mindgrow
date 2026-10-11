import type{Metadata}from"next";import"./globals.css";
export const metadata:Metadata={title:"MindGrow · Play. Think. Learn. Grow.",description:"A little learning garden with playable puzzles, safe visual coding, and private learner progress.",manifest:"/manifest.webmanifest",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return<html lang="en"><body>{children}</body></html>;}
