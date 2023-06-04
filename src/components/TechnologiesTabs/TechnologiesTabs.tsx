import { createSignal } from "solid-js"
import styles from "./TechnologiesTabs.module.scss"

export default function TechnologiesTabs() {

  const [count, setCount] = createSignal(0);
  const increment = () => setCount(c => c + 1);

   return (
    <div class={styles.container}>
      <div>Compteur : {count()}</div>
      <button onClick={increment}>Increment</button>
    </div>
  )
}