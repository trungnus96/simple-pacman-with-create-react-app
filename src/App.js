import React, { memo, useEffect, useReducer, useMemo } from "react";
import "./App.scss";

function generateGrid(number_of_rows) {
  let grid = [];
  for (let row_index = 0; row_index < number_of_rows; row_index++) {
    const number_of_columns = number_of_rows;
    let row = [];
    for (
      let column_index = 0;
      column_index < number_of_columns;
      column_index++
    ) {
      let cell_value = 2; // brick
      if (
        row_index === 0 ||
        row_index === number_of_rows - 1 ||
        column_index === 0 ||
        column_index === number_of_columns - 1
      ) {
        cell_value = 1; // space
      }
      row = [...row, cell_value];
    }
    grid = [...grid, row];
  }

  return grid;
}

// reducer
const SET_NUMBER_OF_ROWS = "SET_NUMBER_OF_ROWS";
const ON_SUBMIT_SUCCESS = "ON_SUBMIT_SUCCESS";
const ON_SUBMIT_ERROR = "ON_SUBMIT_ERROR";
const UPDATE_COORDINATE = "UPDATE_COORDINATE";

const initial_coordinate = {
  number_of_rows: 0,
  grid: [],
  error_message: "",
  x: 0,
  y: 0,
  direction: "right"
};

const coordinate_reducer = (state, action) => {
  switch (action.type) {
    case SET_NUMBER_OF_ROWS:
      return {
        ...state,
        number_of_rows: action.number_of_rows,
        error_message: "",
        grid: []
      };

    case ON_SUBMIT_SUCCESS:
      return {
        ...state,
        grid: action.grid,
        x: 0,
        y: 0
      };

    case ON_SUBMIT_ERROR:
      return {
        ...state,
        grid: [],
        error_message: action.error_message
      };

    case UPDATE_COORDINATE:
      return {
        ...state,
        x: action.x,
        y: action.y,
        direction: action.direction
      };

    default:
      return state;
  }
};

function App() {
  const [coordinate, dispatch] = useReducer(
    coordinate_reducer,
    initial_coordinate
  );
  const { number_of_rows, grid, error_message, x, y, direction } = coordinate;

  const DIRECTIONS = useMemo(
    () => [
      {
        key: 38,
        direction: "up",
        generate_new_coordinate: ({ x, y }) => {
          if (y > 0) {
            return {
              y: y - 1,
              x
            };
          }
        }
      },
      {
        key: 40,
        direction: "down",
        generate_new_coordinate: ({ x, y }) => {
          if (y < number_of_rows - 3) {
            return {
              y: y + 1,
              x
            };
          }
        }
      },
      {
        key: 37,
        direction: "left",
        generate_new_coordinate: ({ x, y }) => {
          if (x > 0) {
            return {
              x: x - 1,
              y
            };
          }
        }
      },
      {
        key: 39,
        direction: "right",
        generate_new_coordinate: ({ x, y }) => {
          if (x < number_of_rows - 3) {
            return {
              x: x + 1,
              y
            };
          }
        }
      }
    ],
    [number_of_rows]
  );

  // hooks
  useEffect(() => {
    document.onkeydown = e => {
      e = e || window.event;
      const { keyCode } = e;

      const find = DIRECTIONS.find(direction => direction.key === keyCode);

      if (find) {
        const { direction, generate_new_coordinate } = find;
        const new_coordinate = generate_new_coordinate({ x, y });
        if (new_coordinate) {
          const { x: new_x, y: new_y } = new_coordinate;
          dispatch({ type: UPDATE_COORDINATE, direction, x: new_x, y: new_y });
        }
      }
    };
    // eslint-disable-next-line
  }, [coordinate]);

  const onInputChange = e => {
    const { value } = e.target;
    dispatch({ type: SET_NUMBER_OF_ROWS, number_of_rows: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (isNaN(number_of_rows) === true || number_of_rows < 4) {
      const error_message =
        "Number of rows must be a number and greater than 4";
      dispatch({ type: ON_SUBMIT_ERROR, error_message });
    } else {
      const _grid = generateGrid(number_of_rows);
      dispatch({ type: ON_SUBMIT_SUCCESS, grid: _grid });
    }
  };

  return (
    <div className="root-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="number_of_rows">Number of rows</label>
        <input
          name="number_of_rows"
          type="text"
          value={number_of_rows}
          onChange={onInputChange}
        />
        <button>Submit</button>
        {error_message && <div className="error-message">{error_message}</div>}
      </form>
      <div className="pacman-container">
        {grid.length !== 0 &&
          grid.map((row, column_index) => {
            return (
              <div className="row" key={column_index}>
                {row.map((cell, row_index) => {
                  let type = "";
                  if (column_index - 1 === y && row_index - 1 === x) {
                    type = `pacman ${direction}`;
                  } else {
                    if (cell === 1) {
                      type = "brick";
                    } else if (cell === 2) {
                      type = "space";
                    }
                  }

                  return <div className={`cell ${type}`} key={row_index}></div>;
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default memo(App);
