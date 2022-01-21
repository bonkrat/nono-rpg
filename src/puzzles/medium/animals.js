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
];
