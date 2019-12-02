export default (duration = 3000) =>
  new Promise(resolve => {
    setTimeout(() => resolve(true), duration);
  });
