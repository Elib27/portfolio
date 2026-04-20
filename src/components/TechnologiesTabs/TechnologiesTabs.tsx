import { createSignal, For, createEffect, on } from 'solid-js'
import styles from './TechnologiesTabs.module.css'
// Languages
import TypescriptLogo from '../../assets/technologies/typescript.svg'
import PythonLogo from '../../assets/technologies/python.svg'
import CLogo from '../../assets/technologies/c.svg'
import RustLogo from '../../assets/technologies/rust.svg?raw'
import JavaLogo from '../../assets/technologies/java.svg'
import SqlLogo from '../../assets/technologies/sql.svg'
// Frameworks & Libraries
import NextLogo from '../../assets/technologies/next.svg?raw'
import ReactLogo from '../../assets/technologies/react.svg'
import AstroLogo from '../../assets/technologies/astro.svg?raw'
import NodeLogo from '../../assets/technologies/nodejs.svg'
import SolidjsLogo from '../../assets/technologies/solidjs.svg'
import VuejsLogo from '../../assets/technologies/vuejs.svg'
import LaravelLogo from '../../assets/technologies/laravel.svg'
import Threejs from '../../assets/technologies/threejs.svg?raw'
import GraphqlLogo from '../../assets/technologies/graphql.svg'
// Tools & Infra
import VercelLogo from '../../assets/technologies/vercel.svg?raw'
import NetlifyLogo from '../../assets/technologies/netlify.svg'
import GitLogo from '../../assets/technologies/git.svg'
import GithubLogo from '../../assets/technologies/github.svg?raw'
import GitlabLogo from '../../assets/technologies/gitlab.svg'
import DockerLogo from '../../assets/technologies/docker.svg'

interface Tech {
  name: string
  logo: ImageMetadata | string
  url: string
}

const tabs: Tech[][] = [
  [
    { name: 'TypeScript', logo: TypescriptLogo, url: 'https://www.typescriptlang.org' },
    { name: 'Python', logo: PythonLogo, url: 'https://www.python.org' },
    { name: 'C/C++', logo: CLogo, url: 'https://en.cppreference.com' },
    { name: 'Rust', logo: RustLogo, url: 'https://www.rust-lang.org' },
    { name: 'Java', logo: JavaLogo, url: 'https://www.java.com' },
    { name: 'SQL', logo: SqlLogo, url: 'https://en.wikipedia.org/wiki/SQL' },
  ],
  [
    { name: 'Next.js', logo: NextLogo, url: 'https://nextjs.org' },
    { name: 'React', logo: ReactLogo, url: 'https://react.dev' },
    { name: 'Astro', logo: AstroLogo, url: 'https://astro.build' },
    { name: 'Node.js', logo: NodeLogo, url: 'https://nodejs.org' },
    { name: 'SolidJS', logo: SolidjsLogo, url: 'https://www.solidjs.com' },
    { name: 'Vue.js', logo: VuejsLogo, url: 'https://vuejs.org' },
    { name: 'Laravel', logo: LaravelLogo, url: 'https://laravel.com' },
    { name: 'Three.js', logo: Threejs, url: 'https://threejs.org' },
    { name: 'GraphQL', logo: GraphqlLogo, url: 'https://graphql.org' },
  ],
  [
    { name: 'Vercel', logo: VercelLogo, url: 'https://vercel.com' },
    { name: 'Netlify', logo: NetlifyLogo, url: 'https://www.netlify.com' },
    { name: 'Docker', logo: DockerLogo, url: 'https://www.docker.com' },
    { name: 'Git', logo: GitLogo, url: 'https://git-scm.com' },
    { name: 'GitHub', logo: GithubLogo, url: 'https://github.com' },
    { name: 'GitLab', logo: GitlabLogo, url: 'https://about.gitlab.com' },
  ],
]

export default function TechnologiesTabs(props: { tab_links: string[] }) {
  const [tab, setTab] = createSignal(0)
  const [visible, setVisible] = createSignal(true)

  createEffect(
    on(
      tab,
      () => {
        setVisible(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true)
          })
        })
      },
      { defer: true },
    ),
  )

  function handleKeyDown(e: KeyboardEvent) {
    const current = tab()
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (current + 1) % props.tab_links.length
      setTab(next)
      ;(document.getElementById(`tech-tab-${next}`) as HTMLElement)?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (current - 1 + props.tab_links.length) % props.tab_links.length
      setTab(prev)
      ;(document.getElementById(`tech-tab-${prev}`) as HTMLElement)?.focus()
    }
  }

  return (
    <div class={styles.container}>
      <div class={styles.tabBar} role="tablist" aria-label="Technology categories">
        <For each={props.tab_links}>
          {(link, index) => (
            <button
              id={`tech-tab-${index()}`}
              role="tab"
              aria-selected={tab() === index()}
              aria-controls={`tech-panel-${index()}`}
              tabindex={tab() === index() ? 0 : -1}
              onClick={() => setTab(index())}
              onKeyDown={handleKeyDown}
              classList={{
                [styles.tabButton]: true,
                [styles.tabButtonActive]: tab() === index(),
              }}
            >
              {link}
            </button>
          )}
        </For>
        <div
          class={styles.tabIndicator}
          style={{
            left: `calc(4px + ${tab()} * (100% - 8px) / ${props.tab_links.length})`,
            width: `calc((100% - 8px) / ${props.tab_links.length})`,
          }}
        />
      </div>

      <div class={styles.panelWrapper}>
        <For each={tabs}>
          {(techList, tabIndex) => (
            <div
              id={`tech-panel-${tabIndex()}`}
              role="tabpanel"
              aria-labelledby={`tech-tab-${tabIndex()}`}
              class={styles.panel}
              classList={{ [styles.panelActive]: tab() === tabIndex() }}
            >
              <div class={styles.grid}>
                <For each={techList}>
                  {(tech, i) => (
                    <a
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class={styles.card}
                      classList={{ [styles.cardVisible]: tab() === tabIndex() && visible() }}
                      style={{ '--card-delay': `${i() * 40}ms` }}
                    >
                      <div class={styles.cardInner}>
                        {typeof tech.logo === 'string' ? (
                          <span class={styles.logo} aria-hidden="true" innerHTML={tech.logo} />
                        ) : (
                          <img src={tech.logo.src} width="56" height="56" alt="" class={styles.logo} loading="lazy" />
                        )}
                        <span class={styles.name}>{tech.name}</span>
                      </div>
                    </a>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
