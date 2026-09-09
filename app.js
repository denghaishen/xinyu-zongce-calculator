const STORAGE_KEY = "xinyu-zongce-calculator-v1";
const fields = ["z1Democracy", "z1Reward", "z1Penalty", "weightedAverage", "z2Bonus", "z3Score", "z4Reward", "z4Penalty", "x1", "x2"];
const limits = { z1Democracy: [0, 10], z1Reward: [0, 20], z1Penalty: [0, Infinity], weightedAverage: [0, 100], z3Score: [0, 100], z4Reward: [0, 20], z4Penalty: [0, Infinity], x1: [0, 5], x2: [0, 5] };

const input = (id) => document.getElementById(id);
const number = (id) => Number.parseFloat(input(id).value) || 0;
const fixed = (value) => value.toFixed(2);

function validateField(element) {
  const range = limits[element.id];
  if (!range || element.value === "") { element.setCustomValidity(""); element.classList.remove("invalid"); return true; }
  const value = Number(element.value);
  const valid = Number.isFinite(value) && value >= range[0] && value <= range[1];
  element.setCustomValidity(valid ? "" : `请输入 ${range[0]} 到 ${range[1] === Infinity ? "更大数值" : range[1]} 之间的数值`);
  element.classList.toggle("invalid", !valid);
  return valid;
}

function calculate() {
  fields.forEach((id) => validateField(input(id)));
  const z1 = 70 + number("z1Democracy") + number("z1Reward") - number("z1Penalty");
  const z2 = number("weightedAverage") * 0.8 + number("z2Bonus") * 0.2;
  const z3 = number("z3Score");
  const z4 = 70 + 10 + number("z4Reward") - number("z4Penalty");
  const z5 = Math.max(number("x2") - number("x1"), 0);
  const total = z1 * 0.2 + (z2 + z5) * 0.6 + z3 * 0.1 + z4 * 0.1;
  const values = { z1, z2, z3, z4, z5 };
  Object.entries(values).forEach(([key, value]) => {
    input(`${key}Result`).textContent = fixed(value);
    input(`summary${key.toUpperCase()}`).textContent = fixed(value);
  });
  input("totalScore").textContent = fixed(total);
  input("calculationSteps").innerHTML = `
    <li>Z1＝70＋${fixed(number("z1Democracy"))}＋${fixed(number("z1Reward"))}－${fixed(number("z1Penalty"))}＝${fixed(z1)}</li>
    <li>Z2＝${fixed(number("weightedAverage"))}×80%＋${fixed(number("z2Bonus"))}×20%＝${fixed(z2)}</li>
    <li>Z3＝${fixed(z3)}</li>
    <li>Z4＝70＋10＋${fixed(number("z4Reward"))}－${fixed(number("z4Penalty"))}＝${fixed(z4)}</li>
    <li>Z5＝max（${fixed(number("x2"))}－${fixed(number("x1"))}，0）＝${fixed(z5)}</li>
    <li>总分＝${fixed(z1)}×20%＋（${fixed(z2)}＋${fixed(z5)}）×60%＋${fixed(z3)}×10%＋${fixed(z4)}×10%＝${fixed(total)}</li>`;
}

function showStatus(message) {
  input("statusMessage").textContent = message;
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => input("statusMessage").textContent = "", 2600);
}

function saveData() {
  const data = Object.fromEntries(fields.map((id) => [id, input(id).value]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  showStatus("数据已保存在当前浏览器");
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) { showStatus("当前浏览器中没有已保存的数据"); return; }
  try {
    const data = JSON.parse(saved);
    fields.forEach((id) => { if (Object.hasOwn(data, id)) input(id).value = data[id]; });
    calculate(); showStatus("已读取保存的数据");
  } catch { showStatus("保存的数据无法读取"); }
}

function clearData() {
  fields.forEach((id) => input(id).value = "0");
  localStorage.removeItem(STORAGE_KEY);
  calculate(); showStatus("数据已清空");
}

function fillExample() {
  const example = { z1Democracy: 10, z1Reward: 0, z1Penalty: 0, weightedAverage: 77.52, z2Bonus: 30, z3Score: 70, z4Reward: 10, z4Penalty: 0, x1: 2.39, x2: 3.14 };
  Object.entries(example).forEach(([id, value]) => input(id).value = value);
  calculate(); showStatus("已填入示例，结果应为 73.26 分");
}

fields.forEach((id) => input(id).addEventListener("input", calculate));
input("saveButton").addEventListener("click", saveData);
input("loadButton").addEventListener("click", loadData);
input("clearButton").addEventListener("click", clearData);
input("exampleButton").addEventListener("click", fillExample);
calculate();
