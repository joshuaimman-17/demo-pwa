import { create } from 'zustand';

export interface Zombie {
    id: string;
    position: [number, number, number];
    health: number;
    state: 'idle' | 'walking' | 'attacking' | 'dead';
    distance: number;
}

export interface GameState {
    // Player stats
    health: number;
    maxHealth: number;
    ammo: number;
    maxAmmo: number;
    score: number;

    // Game state
    isPlaying: boolean;
    isPaused: boolean;
    isGameOver: boolean;
    wave: number;

    // Zombies
    zombies: Zombie[];
    maxZombies: number;

    // Weapon state
    isReloading: boolean;
    lastFireTime: number;
    fireRate: number; // ms between shots

    // Actions
    takeDamage: (amount: number) => void;
    heal: (amount: number) => void;
    fire: () => boolean;
    reload: () => void;
    addZombie: (zombie: Zombie) => void;
    removeZombie: (id: string) => void;
    updateZombie: (id: string, updates: Partial<Zombie>) => void;
    damageZombie: (id: string, damage: number) => void;
    addScore: (points: number) => void;
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    gameOver: () => void;
    reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    health: 100,
    maxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    score: 0,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    wave: 1,
    zombies: [],
    maxZombies: 7,
    isReloading: false,
    lastFireTime: 0,
    fireRate: 200, // 200ms between shots

    // Actions
    takeDamage: (amount) => set((state) => {
        const newHealth = Math.max(0, state.health - amount);
        if (newHealth === 0) {
            return { health: newHealth, isGameOver: true, isPlaying: false };
        }
        return { health: newHealth };
    }),

    heal: (amount) => set((state) => ({
        health: Math.min(state.maxHealth, state.health + amount)
    })),

    fire: () => {
        const state = get();
        const now = Date.now();

        if (state.ammo <= 0 || state.isReloading || now - state.lastFireTime < state.fireRate) {
            return false;
        }

        set({ ammo: state.ammo - 1, lastFireTime: now });
        return true;
    },

    reload: () => {
        const state = get();
        if (state.isReloading || state.ammo === state.maxAmmo) return;

        set({ isReloading: true });
        setTimeout(() => {
            set({ ammo: get().maxAmmo, isReloading: false });
        }, 2000); // 2 second reload time
    },

    addZombie: (zombie) => set((state) => {
        if (state.zombies.length >= state.maxZombies) return state;
        return { zombies: [...state.zombies, zombie] };
    }),

    removeZombie: (id) => set((state) => ({
        zombies: state.zombies.filter(z => z.id !== id)
    })),

    updateZombie: (id, updates) => set((state) => ({
        zombies: state.zombies.map(z => z.id === id ? { ...z, ...updates } : z)
    })),

    damageZombie: (id, damage) => set((state) => ({
        zombies: state.zombies.map(z => {
            if (z.id === id) {
                const newHealth = Math.max(0, z.health - damage);
                return {
                    ...z,
                    health: newHealth,
                    state: newHealth === 0 ? 'dead' as const : z.state
                };
            }
            return z;
        })
    })),

    addScore: (points) => set((state) => ({
        score: state.score + points
    })),

    startGame: () => set({
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        health: 100,
        ammo: 30,
        score: 0,
        wave: 1,
        zombies: []
    }),

    pauseGame: () => set({ isPaused: true }),

    resumeGame: () => set({ isPaused: false }),

    gameOver: () => set({
        isGameOver: true,
        isPlaying: false
    }),

    reset: () => set({
        health: 100,
        ammo: 30,
        score: 0,
        isPlaying: false,
        isPaused: false,
        isGameOver: false,
        wave: 1,
        zombies: [],
        isReloading: false,
        lastFireTime: 0
    })
}));
