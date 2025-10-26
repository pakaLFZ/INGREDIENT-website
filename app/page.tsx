import { Hero } from "@/components/hero"
import { Introduction } from "@/components/introduction"
import { Strength } from "@/components/strength"
import Service from "@/components/service"
import Contact from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <Strength />
      <Service />
      <Contact />
      <Footer />
    </>
  )
}
