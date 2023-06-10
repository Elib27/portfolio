import { children, createSignal, JSXElement, Show } from "solid-js"
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
import Threejs from "../../assets/technologies/threejs.svg"
import GsapLogo from "../../assets/technologies/gsap.svg"
import PrismaLogo from "../../assets/technologies/prisma.svg"
import SqlLogo from "../../assets/technologies/sql.svg"
// Tools
import GitLogo from "../../assets/technologies/git.svg"
import JestLogo from "../../assets/technologies/jest.svg"
import NetlifyLogo from "../../assets/technologies/netlify.svg"
import VercelLogo from "../../assets/technologies/vercel.svg"
import GithubLogo from "../../assets/technologies/github.svg"
import GitlabLogo from "../../assets/technologies/gitlab.svg"

const tab_links = ["Technos principales", "Autres technos", "Outils"];

function Tab(props: { tabIndex: number, currentTab: number, children: JSXElement}) {
  return (
    <div classList={{
      [styles.tab]: true,
      [styles.tab_active]: props.currentTab === props.tabIndex,
      [styles.tab_up]: props.currentTab > props.tabIndex,
      [styles.tab_down]: props.currentTab < props.tabIndex
      }}
    >
      {props.children}
    </div>
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
            classList={{ [styles.tab_link]: true, [styles.tab_link_active]: tab() === index + 1 }}
          >{link}</button>
        ))}
        <div classList={{ [styles.tab_selector]: true, [styles["tab_" + tab()]]: true }}></div>
      </div>
      <div class={styles.tab_container}>
        <Tab tabIndex={1} currentTab={tab()}>
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
        </Tab>
        <Tab tabIndex={2} currentTab={tab()}>
          <div>
            <img src={SolidjsLogo.src} height="80px" width="80px" alt="solid js logo" />
            <p class={styles.techno_title}>SolidJS</p>
          </div>
          <div>
            <img src={WordpressLogo.src} height="80px" width="80px" alt="wordpress logo" />
            <p class={styles.techno_title}>WordPress</p>
          </div>
          <div>
            <img src={Threejs.src} height="80px" width="80px" alt="wordpress logo" />
            <p class={styles.techno_title}>ThreeJS</p>
          </div>
          <div>
            <img src={GsapLogo.src} height="80px" width="80px" alt="gsap logo" />
            <p class={styles.techno_title}>GSAP</p>
          </div>
          <div>
            <img src={PrismaLogo.src} height="80px" width="80px" alt="prisma logo" />
            <p class={styles.techno_title}>Prisma</p>
          </div>
          <div>
            <img src={SqlLogo.src} height="80px" width="80px" alt="sql logo" />
            <p class={styles.techno_title}>SQL</p>
          </div>
        </Tab>
        <Tab tabIndex={3} currentTab={tab()}>
          <div>
            <img src={GitLogo.src} height="80px" width="80px" alt="git logo" />
            <p class={styles.techno_title}>Git</p>
          </div>
          <div>
            <img src={JestLogo.src} height="80px" width="80px" alt="jest logo" />
            <p class={styles.techno_title}>Jest</p>
          </div>
          <div>
            <img src={NetlifyLogo.src} height="80px" width="80px" alt="netlify logo" />
            <p class={styles.techno_title}>Netlify</p>
          </div>
          <div>
            <img src={VercelLogo.src} height="80px" width="80px" alt="vercel logo" />
            <p class={styles.techno_title}>Vercel</p>
          </div>
          <div>
            <img src={GithubLogo.src} height="80px" width="80px" alt="github logo" />
            <p class={styles.techno_title}>Github</p>
          </div>
          <div>
            <img src={GitlabLogo.src} height="80px" width="80px" alt="gitlab logo" />
            <p class={styles.techno_title}>GitLab</p>
          </div>
        </Tab>
      </div>
    </div>
  )
}