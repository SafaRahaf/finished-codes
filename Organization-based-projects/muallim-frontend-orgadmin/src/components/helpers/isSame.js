import { isEqual } from "lodash";

const isSame = (value, compareValue) =>
  isEqual(value, compareValue) ? false : value;
export default isSame;
