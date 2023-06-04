import { createSignal, createEffect, Show } from "solid-js"
import styles from "./TechnologiesTabs.module.css"
// Main technos
import ReactLogo from "../../assets/technologies/react.svg"
import AstroLogo from "../../assets/technologies/astro.svg"
import NextLogo from "../../assets/technologies/next.svg"
import NodeLogo from "../../assets/technologies/nodejs.svg"
import TypescriptLogo from "../../assets/technologies/typescript.svg"
import SassLogo from "../../assets/technologies/sass.svg"
// Other technos
import Solidjs from "../../assets/technologies/solidjs.svg"

const tab_links = ["Technos principales", "Autres technos", "Outils"];

function MainTechnosTab(props: {active: boolean}) {
  return (
    <Show when={props.active}>
      <div>
        <img src={ReactLogo.src} height="80px" width="80px" alt="react logo" />
        <p class={styles.techno_title}>React</p>
      </div>
      <div>
        <img src={AstroLogo.src} height="80px" width="80px" alt="astro logo" />
        <p class={styles.techno_title}>Astro</p>
      </div>
      <div>
        <img src={NextLogo.src} height="80px" width="80px" alt="next logo" />
        <p class={styles.techno_title}>Next JS</p>
      </div>
      <div>
        <img src={NodeLogo.src} height="80px" width="80px" alt="node logo" />
        <p class={styles.techno_title}>Node JS</p>
      </div>
      <div>
        <img src={TypescriptLogo.src} height="80px" width="80px" alt="typescript logo" />
        <p class={styles.techno_title}>Typescript</p>
      </div>
      <div>
        <img src={SassLogo.src} height="80px" width="80px" alt="sass logo" />
        <p class={styles.techno_title}>SASS</p>
      </div>
    </Show>
  )
}

function OtherTechnosTab(props: {active: boolean}) {
  return (
    <Show when={props.active}>
      <div>
        <img src={Solidjs.src} height="80px" width="80px" alt="solid js logo" />
        <p class={styles.techno_title}>SolidJS</p>
      </div>
    </Show>
  )
}

function ToolsTab(props: {active: boolean}) {
  return (
    <Show when={props.active}>
      <div>
        Tools
      </div>
    </Show>
  )
}

export default function TechnologiesTabs() {

  const [tab, setTab] = createSignal(0);

  createEffect(() => {
    console.log("active tab: " + tab())
  })

   return (
    <div class={styles.container}>
      <div class={styles.tab_links_container}>
        {tab_links.map((link, index) => (
          <button
            onClick={() => setTab(index)}
            classList={{[styles.tab_link]: true, [styles.tab_link_active]: tab() === index}}
          >{link}</button>
        ))}
      </div>
      <div class={styles.tab}>
        <MainTechnosTab active={tab() === 0} />
        <OtherTechnosTab active={tab() === 1} />
        <ToolsTab active={tab() === 2} />
      </div>
    </div>
  )
}