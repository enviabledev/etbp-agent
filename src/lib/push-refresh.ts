type RefreshListener = () => void;
const listeners: RefreshListener[] = [];

export function onPushRefresh(listener: RefreshListener) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i >= 0) listeners.splice(i, 1);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function triggerPushRefresh(dataType: string) {
  listeners.forEach((fn) => fn());
}
