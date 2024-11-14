// User.ts

export class User {
    uid: string;
    email: string;
    role: string;
    createdAt: Date;

    constructor(uid: string, email: string, role: string, createdAt: Date) {
        this.uid = uid;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    isSeller(): boolean {
        return this.role === "seller";
    }

    updateRole(newRole: string) {
        this.role = newRole;
    }

    static fromFirestoreData(uid: string, data: any): User {
        return new User(uid, data.email, data.role, new Date(data.createdAt.seconds * 1000));
    }
}
