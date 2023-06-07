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
import SolidjsLogo from "../../assets/technologies/solidjs.svg"
import WordpressLogo from "../../assets/technologies/wordpress.svg"
// Tools
import GitLogo from "../../assets/technologies/git.svg"
import JestLogo from "../../assets/technologies/jest.svg"

const tab_links = ["Technos principales", "Autres technos", "Outils"];

function MainTechnosTab(props: { active: boolean }) {
  return (
    <Show when={props.active}>
      <div>
        <img src={NextLogo.src} height="80px" width="80px" alt="next logo" />
        <p class={styles.techno_title}>Next JS</p>
      </div>
      <div>
        <img src={ReactLogo.src} height="80px" width="80px" alt="react logo" />
        <p class={styles.techno_title}>React</p>
      </div>
      <div>
        <img src={AstroLogo.src} height="80px" width="80px" alt="astro logo" />
        <p class={styles.techno_title}>Astro</p>
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

function OtherTechnosTab(props: { active: boolean }) {
  return (
    <Show when={props.active}>
      <div>
        <img src={SolidjsLogo.src} height="80px" width="80px" alt="solid js logo" />
        <p class={styles.techno_title}>SolidJS</p>
      </div>
      <div>
        <img src={WordpressLogo.src} height="80px" width="80px" alt="wordpress logo" />
        <p class={styles.techno_title}>WordPress</p>
      </div>
    </Show>
  )
}

function ToolsTab(props: { active: boolean }) {
  return (
    <Show when={props.active}>
      <div>
        <img src={GitLogo.src} height="80px" width="80px" alt="git logo" />
        <p class={styles.techno_title}>Git</p>
      </div>
      <div>
        <img src={JestLogo.src} height="80px" width="80px" alt="jest logo" />
        <p class={styles.techno_title}>Jest</p>
      </div>
    </Show>
  )
}

export default function TechnologiesTabs() {

  const [tab, setTab] = createSignal(1);

  return (
    <div class={styles.container}>
      <div class={styles.tab_links_container}>
        {tab_links.map((link, index) => (
          <button
            onClick={() => setTab(index + 1)}
            classList={{[styles.tab_link]: true, [styles.tab_link_active]: tab() === index + 1}}
          >{link}</button>
        ))}
        <div classList={{[styles.tab_selector]: true, [styles["tab_" + tab()]]: true}}></div>
      </div>
      <div class={styles.tab}>
        <MainTechnosTab active={tab() === 1} />
        <OtherTechnosTab active={tab() === 2} />
        <ToolsTab active={tab() === 3} />
      </div>
    </div>
  )
}