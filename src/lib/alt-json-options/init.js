import altJSONs from "../alt-json/index.js";
const initAltJSONOptions = () => {
  const ds = Array.from(document.querySelectorAll("[data-alt-json-options]")).filter((el) => el instanceof HTMLElement);
  ds.forEach((el) => {
    el.innerHTML = "";
    const opts = altJSONs.map((a) => {
      const opt = document.createElement("option");
      opt.value = a.name;
      opt.innerText = a.display;
      return opt;
    });
    el.append(...opts);
  });
};
export default initAltJSONOptions;
