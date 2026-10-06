// Timestamp-based humidity: clients and server derive the same state without frame-rate drift.
export function humidityAt(environment, now) {
  const elapsed=Math.max(0,now-environment.at)/1000;
  const target=environment.shower?(environment.fan?.12:1):0;
  const seconds=environment.fan?14:environment.shower?22:65;
  return target+(environment.humidity-target)*Math.exp(-elapsed/seconds);
}
export function changeShower(environment,on,now) {
  return {...environment,shower:on,humidity:humidityAt(environment,now),at:now};
}
export function changeFan(environment,on,now) {
  return {...environment,fan:on,humidity:humidityAt(environment,now),at:now};
}
