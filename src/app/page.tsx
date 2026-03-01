import { Header } from "@/components/header";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { HowWeWork } from "@/components/sections/how-we-work";
import { Difference } from "@/components/sections/difference";
import { Trust } from "@/components/sections/trust";
import { Team } from "@/components/sections/team";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";
import { IntroAnimation } from "@/components/intro-animation";

export default function Home() {
  return (
    <IntroAnimation>
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
    </IntroAnimation>
  );
}
