type EventOptions<TMeta = any> = {
	once?: boolean;
	meta?: TMeta;
};

enum EffectStatus {
	idle = "idle",
	pending = "pending",
	resolved = "resolved",
	rejected = "rejected",
}

export { EventOptions, EffectStatus };
