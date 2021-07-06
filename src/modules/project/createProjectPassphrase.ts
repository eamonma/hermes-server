import Filter from "bad-words"
const filter = new Filter()
const letters = "abcdefghijklmnopqrstuvwxyz"

export const createProjectPassphrase = (
  x: number = 4,
  y: number = 3
): string => {
  let passphraseArray: string[] = []

  do {
    for (let i = 0; i < x; i++) {
      let set = ""
      for (let j = 0; j < y; j++) {
        const rand = Math.floor(Math.random() * letters.length)
        set += letters[rand]
      }
      passphraseArray.push(set)
    }
  } while (filter.isProfane(passphraseArray.join(" ")))

  return passphraseArray.join("")
}
