import { Puzzle } from "../../../types/puzzle";

export default [
  {
    name: "Duck",
    puzzles: [
      {
        rowClues: [[2], [2], [1, 1], [1, 1], [4]],
        colClues: [[1], [4], [1, 1], [1, 1], [1, 2]],
        hint: {
          direction: "col",
          index: 1,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "dd0b227a01993cec326a00a9a63fd64dff7d2cede27f4ba71fda14a34e19820f",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[2], [2], [1], [1], [2]],
        colClues: [[1], [2], [4], [1], [0]],
        hint: {
          direction: "col",
          index: 2,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "bda320a6e7b2a454e9c90f2cb413a4eccb24fe4dcb45a33148f55dc72c663836",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[1], [1], [2], [1], [3]],
        colClues: [[1], [3], [1, 1], [1], [1]],
        hint: {
          direction: "col",
          index: 1,
          cells: [
            { selected: false, color: "black" },
            { selected: true, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "92421af593aa4ac8f5eaeca6c320c1afbbf0fa67c0ee225882f036088330a7ce",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[2, 1], [1, 1], [1], [1, 1], [4]],
        colClues: [[1, 2], [1, 1], [1, 1], [1], [4]],
        hint: {
          direction: "col",
          index: 4,
          cells: [
            { selected: true, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "1a19e40d07cd64418bddc9f6797ed0ddcb9036457f2acde241a2b4c315f83822",
        height: 5,
        width: 5,
      },
    ],
  },
  {
    name: "Orange",
    puzzles: [
      {
        rowClues: [[1], [3], [2], [1], [2]],
        colClues: [[1], [3], [2], [1], [2]],
        hint: {
          direction: "col",
          index: 1,
          cells: [
            { selected: false, color: "black" },
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "b074bc88c0e33ac0da7c8d4d549606ebb6afbfa34759d9267198a7e5f9db5d43",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[1], [3], [2, 1], [1], [1]],
        colClues: [[1, 1], [1], [1], [1], [4]],
        hint: {
          direction: "col",
          index: 4,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: true, color: "black" },
          ],
        },
        resultSha:
          "8ff7b9cbbe4ea84d3239abd4afef1fde72cfe5f485e46039f7861d7e39e12bd7",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[1], [1], [1], [1], [3]],
        colClues: [[1], [3], [1], [1], [1]],
        hint: {
          direction: "col",
          index: 1,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { selected: true, color: "black" },
            { color: "black", selected: true },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "536de4bd0afed9c9fc384b20673bb7aa847b7b4a0093822e1f0b7e0ca9e432b7",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[1], [1], [1], [2], [4]],
        colClues: [[1], [1], [1], [2], [4]],
        hint: {
          direction: "col",
          index: 4,
          cells: [
            { selected: true, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "2d503f08e9375ecce1ef0d3991a267c52ae8db0b2da67c0fbb35d790c1c2114e",
        height: 5,
        width: 5,
      },
    ],
  },
  {
    name: "Smiley",
    puzzles: [
      {
        rowClues: [[3], [2], [2], [1, 1], [1]],
        colClues: [[2], [2], [2], [1, 2], [1]],
        hint: {
          direction: "col",
          index: 3,
          cells: [
            { color: "black", selected: true },
            { selected: false, color: "black" },
            { selected: false, color: "black" },
            { selected: true, color: "black" },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "554debe05630fbde89e4cdadee043e41b85ce9c1eec92f30062df64eba2d4aae",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[1], [3], [2], [1, 2], [1]],
        colClues: [[2], [1, 2], [2], [2], [1]],
        hint: {
          direction: "col",
          index: 1,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { selected: false, color: "black" },
            { selected: true, color: "black" },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "8c63b31f1ca9e90fba3b1727f2bb2d966e64eb513c2137fbfebcabe0c6d7e873",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[2, 2], [2], [3], [0], [2, 1]],
        colClues: [[1], [2, 1], [2, 1], [1, 1], [1, 1, 1]],
        hint: {
          direction: "row",
          index: 0,
          selectedCells: [
            { selected: true, color: "black" },
            { color: "black", selected: true },
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "290504b8e19abecd85ba3cf69e6c2f0ed94ecee5368ac455caef31ca351a6da0",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[2], [0], [0], [0], [3]],
        colClues: [[1], [1, 1], [1, 1], [0], [0]],
        hint: {
          direction: "row",
          index: 4,
          selectedCells: [
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "18b859d67347e6ca3a9f44dace49aa209b377b4d7d4665a6a00338cabd1340cc",
        height: 5,
        width: 5,
      },
    ],
  },
  {
    name: "Eyes",
    puzzles: [
      {
        rowClues: [[0], [1], [2], [1], [0]],
        colClues: [[0], [2], [2], [0], [0]],
        hint: {
          direction: "col",
          index: 1,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "f856eb87ef96169b6475a5b529ce0ed0608327518d383396a51eccf629094bf8",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[0], [1], [2], [1], [1]],
        colClues: [[2], [2], [0], [1], [0]],
        hint: {
          direction: "col",
          index: 0,
          cells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "022364bb930a6daad41dee3b2825987779189b2b7571b479c1202f7af89288b9",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[0], [2], [3], [0], [0]],
        colClues: [[0], [1], [2], [1], [1]],
        hint: {
          direction: "row",
          index: 2,
          selectedCells: [
            { selected: false, color: "black" },
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
          ],
        },
        resultSha:
          "18cc7cdb665dc7e94c71ace01c0174c81d0a3bfe0c1d71366317cbbca5b4879a",
        height: 5,
        width: 5,
      },
      {
        rowClues: [[1], [3], [3], [0], [0]],
        colClues: [[1], [2], [2], [2], [0]],
        hint: {
          direction: "row",
          index: 1,
          selectedCells: [
            { selected: false, color: "black" },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { color: "black", selected: true },
            { selected: false, color: "black" },
          ],
        },
        resultSha:
          "502c3daa528ee7d6605c47cb61a71aa21727de3743778c74d175cc5120b68c50",
        height: 5,
        width: 5,
      },
    ],
  },
] as Puzzle[];
