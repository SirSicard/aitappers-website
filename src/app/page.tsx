import { Header } from "@/components/header";
import { HeroGrid } from "@/components/hero-grid";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { HowWeWork } from "@/components/sections/how-we-work";
import { Difference } from "@/components/sections/difference";
import { Trust } from "@/components/sections/trust";
import { Team } from "@/components/sections/team";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <HeroGrid />
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowWeWork />
        <Difference />
        <Trust />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
