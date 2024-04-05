//===================
//GETTER
//===================

/**
 * getAccessToken from LocalStorage
 * @returns googleAccessToken
 */
export const getAT = (): string => {
	return window.localStorage.getItem(`${app.appId}-google-tasks-import-accessToken`) ?? "";
};

/**
 * getRefreshToken from LocalStorage
 * @returns googleRefreshToken
 */
export const getRT = (): string => {
	return window.localStorage.getItem(`${app.appId}-google-tasks-import-refreshToken`) ?? "";
};

/**
 * getExpirationTime from LocalStorage
 * @returns googleExpirationTime
 */
export const getET = (): number => {
	const expirationTimeString =
		window.localStorage.getItem(`${app.appId}-google-tasks-import-expirationTime`) ?? "0";
	return parseInt(expirationTimeString, 10);
};

//===================
//SETTER
//===================

/**
 * set AccessToken into LocalStorage
 * @param googleAccessToken googleAccessToken
 * @returns googleAccessToken
 */
export const setAT = (googleAccessToken: string) => {
	window.localStorage.setItem(`${app.appId}-google-tasks-import-accessToken`, googleAccessToken);
};

/**
 * set RefreshToken from LocalStorage
 * @param googleRefreshToken googleRefreshToken
 * @returns googleRefreshToken
 */
export const setRT = (googleRefreshToken: string) => {
	window.localStorage.setItem(`${app.appId}-google-tasks-import-refreshToken`, googleRefreshToken);
};

/**
 * set ExpirationTime from LocalStorage
 * @param googleExpirationTime googleExpirationTime
 * @returns googleExpirationTime
 */
export const setET = (googleExpirationTime: number) => {
	window.localStorage.setItem(
		`${app.appId}-google-tasks-import-expirationTime`,
		googleExpirationTime + ""
	);
};
