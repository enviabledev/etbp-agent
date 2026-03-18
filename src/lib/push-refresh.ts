type RefreshListener = () => void;
const listeners: RefreshListener[] = [];

export function onPushRefresh(listener: RefreshListener) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function triggerPushRefresh(dataType: string) {
  // For the agent portal, just trigger all listeners to reload their data
  listeners.forEach((fn) => fn());
}
