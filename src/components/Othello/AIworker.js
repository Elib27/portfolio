const GAMEBOARD_SIZE = 8;

function copyArray(src, dest) {
  for (let i = 0; i < src.length; i++) {
    dest[i] = src[i];
  }
}

function convertAImoveToMove(AImove) {
  const row = Math.floor(AImove / GAMEBOARD_SIZE);
  const column = AImove % GAMEBOARD_SIZE;
  const move = { row, column };
  return move;
}

function convertGameboardToArray(gameboard) {
  const gameboardArray = new Int8Array(GAMEBOARD_SIZE * GAMEBOARD_SIZE);
  for (let i = 0; i < GAMEBOARD_SIZE; i++) {
    for (let j = 0; j < GAMEBOARD_SIZE; j++) {
      gameboardArray[i * GAMEBOARD_SIZE + j] = gameboard[i][j].charCodeAt(0);
    }
  }
  return gameboardArray;
}

WebAssembly.instantiateStreaming(fetch(new URL('./othelloAI.wasm', import.meta.url).href), {}).then(obj => {

  const getAImove = obj.instance.exports.getAImove;

  const generateAImove = async (gameboard, player, difficulty) => {
    const arrayGameboard = convertGameboardToArray(gameboard);
    const WASMmemory = obj.instance.exports.memory;
    const arrayGameboardMemory = new Int8Array(WASMmemory.buffer);
    copyArray(arrayGameboard, arrayGameboardMemory);
    const result = getAImove(arrayGameboardMemory, player.charCodeAt(0), difficulty);
    const move = convertAImoveToMove(result);
    return move;
  }

  self.onmessage = async (event) => {
    const { gameboard, player, difficulty } = event.data;
    const AImove = await generateAImove(gameboard, player, difficulty)
    self.postMessage({ move: AImove });
  };
});