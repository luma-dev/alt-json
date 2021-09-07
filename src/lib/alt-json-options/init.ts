import altJSONs from '../alt-json';

const initAltJSONOptions = (): void => {
  const ds = Array.from(document.querySelectorAll('[data-alt-json-options]')).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );
  ds.forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.innerHTML = '';
    const opts = altJSONs.map((a) => {
      const opt = document.createElement('option');
      opt.value = a.name;
      opt.innerText = a.display;
      return opt;
    });
    el.append(...opts);
  });
};

export default initAltJSONOptions;
