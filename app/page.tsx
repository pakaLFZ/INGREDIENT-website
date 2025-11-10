import { Hero } from "@/components/hero"
import { Introduction } from "@/components/introduction"
import { Strength } from "@/components/strength"
import Service from "@/components/service"
import Contact from "@/components/contact"
import { Footer } from "@/components/footer"
import DemoRBC from "@/components/demo-rbc"

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <DemoRBC />
      <Strength />
      <Service />
      <Contact />
      <Footer />
    </>
  )
}
