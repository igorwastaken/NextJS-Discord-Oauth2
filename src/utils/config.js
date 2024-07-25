function validateEnv(key, defaultValue, warnDefault) {
	const value = process.env[key];

	if (!value) {
		if (typeof defaultValue !== "undefined") {
			if (warnDefault) {
				const message = `validateEnv is using a default value for ${key} and has this warning enabled.`;
				console.warn(new Error(message));
			}

			return defaultValue;
		} else {
			throw new Error(`${key} is not defined in environment variables`);
		}
	}

	return value;
}

export const config = {
	cookieName: "token",
	clientId: validateEnv("CLIENT_ID"),
	clientSecret: validateEnv("CLIENT_SECRET"),
	appUri: validateEnv("APP_URI", "http://localhost:3000", true),
	jwtSecret: validateEnv(
		"JWT_SECRET",
		"this is a development value that should be changed in production!!!!!",
		true,
	),
};
