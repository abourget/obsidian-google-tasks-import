const prefix = (varName: string): string => {
  return `${app.appId}-google-tasks-import-${varName}`;
}

export const getAT = (): string => {
	return window.localStorage.getItem(prefix("accessToken")) ?? "";
};
export const setAT = (googleAccessToken: string) => {
	window.localStorage.setItem(prefix("accessToken"), googleAccessToken);
};

export const getRT = (): string => {
	return window.localStorage.getItem(prefix("refreshToken")) ?? "";
};
export const setRT = (googleRefreshToken: string) => {
	window.localStorage.setItem(prefix("refreshToken"), googleRefreshToken);
};

export const getET = (): number => {
	const expirationTimeString =
		window.localStorage.getItem(prefix("expirationTime")) ?? "0";
	return parseInt(expirationTimeString, 10);
};
export const setET = (googleExpirationTime: number) => {
	window.localStorage.setItem(prefix("expirationTime"), googleExpirationTime + "");
};
