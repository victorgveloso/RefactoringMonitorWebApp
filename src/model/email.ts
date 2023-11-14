import { Lambda } from './lambda';

export class Email {
    
    constructor(private lambda : Lambda,
        private id: number, 
        private alternativeEmail: string, 
        private recipient: string,
        private date: Date, 
        private body: string,
        private sender: string,
        private recipientIsUser: boolean,
        private subject: string) {}

    public getID() : number { return this.id; }
    public getAlternativeEmail() : string { return this.alternativeEmail; }
    public getRecipient() : string { return this.recipient; }
    public getDate() : Date { return this.date; }
    public getBody() : string { return this.body; }
    public getSender() : string { return this.sender; }
    public getRecipientIsUser() : boolean { return this.recipientIsUser; }
    public getSubject() : string { return this.subject };
    
}