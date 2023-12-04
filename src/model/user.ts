export class User {
    
    constructor(private userID, private userName, private name: string, private familyName: string, private role: string, private email: string, private jwt: string) {}

    public getUserID() { return this.userID; }
    public getUserName() { return this.userName; }
    public getFullName() { return this.name + " " + this.familyName; }
    public getRole() { return this.role; }
    public getEmail() { return this.email; }
    public getJWT() { return this.jwt; }

    public isAdmin() { return this.role.toUpperCase() == "ADMIN"; }
   
}