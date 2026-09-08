import type { Metadata } from "next";

import NotFoundTerminal from "@/src/components/SystemMessage/NotFoundTerminal";

export const metadata: Metadata = {
  title: "404",
  description: "That path does not exist on this site.",
  robots: { index: false, follow: true },
};

const NotFound = () => <NotFoundTerminal />;

export default NotFound;
