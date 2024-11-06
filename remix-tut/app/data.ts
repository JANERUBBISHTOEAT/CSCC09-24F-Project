////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Remix, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from "match-sorter";
// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";
import invariant from "tiny-invariant";

type FileMutation = {
  id?: string;
  filename?: string;
  magnet?: string;
  token?: string; // should be a number
  notes?: string;
  favorite?: boolean;
};

export type ContactRecord = FileMutation & {
  id: string;
  createdAt: string;
};

////////////////////////////////////////////////////////////////////////////////
// This is just a fake DB table. In a real app you'd be talking to a real db or
// fetching from an existing API.
const fakeContacts = {
  records: {} as Record<string, ContactRecord>,

  async getAll(): Promise<ContactRecord[]> {
    return Object.keys(fakeContacts.records)
      .map((key) => fakeContacts.records[key])
      .sort(sortBy("-createdAt", "last"));
  },

  async get(id: string): Promise<ContactRecord | null> {
    return fakeContacts.records[id] || null;
  },

  async create(values: FileMutation): Promise<ContactRecord> {
    const id = values.id || Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const newContact = { id, createdAt, ...values };
    fakeContacts.records[id] = newContact;
    return newContact;
  },

  async set(id: string, values: FileMutation): Promise<ContactRecord> {
    const contact = await fakeContacts.get(id);
    invariant(contact, `No contact found for ${id}`);
    const updatedContact = { ...contact, ...values };
    fakeContacts.records[id] = updatedContact;
    return updatedContact;
  },

  destroy(id: string): null {
    delete fakeContacts.records[id];
    return null;
  },
};

////////////////////////////////////////////////////////////////////////////////
// Handful of helper functions to be called from route loaders and actions
export async function getContacts(query?: string | null) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  let contacts = await fakeContacts.getAll();
  if (query) {
    contacts = matchSorter(contacts, query, {
      keys: ["filename", "token"],
    });
  }
  return contacts.sort(sortBy("last", "createdAt"));
}

export async function createEmptyContact() {
  const contact = await fakeContacts.create({});
  return contact;
}

export async function getContact(id: string) {
  return fakeContacts.get(id);
}

export async function updateContact(id: string, updates: FileMutation) {
  const contact = await fakeContacts.get(id);
  if (!contact) {
    throw new Error(`No contact found for ${id}`);
  }
  await fakeContacts.set(id, { ...contact, ...updates });
  return contact;
}

export async function deleteContact(id: string) {
  fakeContacts.destroy(id);
}

[
  {
    magnet:
      "https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
    filename: "Shruti",
    token: "Kapoor",
    notes: "@shrutikapoor08",
  },
  {
    magnet:
      "https://sessionize.com/image/1940-400o400o2-Enh9dnYmrLYhJSTTPSw3MH.jpg",
    filename: "Glenn",
    token: "Reyes",
    notes: "@glnnrys",
  },
  {
    magnet:
      "https://sessionize.com/image/9273-400o400o2-3tyrUE3HjsCHJLU5aUJCja.jpg",
    filename: "Ryan",
    token: "Florence",
  },
  {
    magnet:
      "https://sessionize.com/image/d14d-400o400o2-pyB229HyFPCnUcZhHf3kWS.png",
    filename: "Oscar",
    token: "Newman",
    notes: "@__oscarnewman",
  },
  {
    magnet:
      "https://sessionize.com/image/fd45-400o400o2-fw91uCdGU9hFP334dnyVCr.jpg",
    filename: "Michael",
    token: "Jackson",
  },
  {
    magnet:
      "https://sessionize.com/image/b07e-400o400o2-KgNRF3S9sD5ZR4UsG7hG4g.jpg",
    filename: "Christopher",
    token: "Chedeau",
    notes: "@Vjeux",
  },
  {
    magnet:
      "https://sessionize.com/image/262f-400o400o2-UBPQueK3fayaCmsyUc1Ljf.jpg",
    filename: "Cameron",
    token: "Matheson",
    notes: "@cmatheson",
  },
  {
    magnet:
      "https://sessionize.com/image/820b-400o400o2-Ja1KDrBAu5NzYTPLSC3GW8.jpg",
    filename: "Brooks",
    token: "Lybrand",
    notes: "@BrooksLybrand",
  },
  {
    magnet:
      "https://sessionize.com/image/df38-400o400o2-JwbChVUj6V7DwZMc9vJEHc.jpg",
    filename: "Alex",
    token: "Anderson",
    notes: "@ralex1993",
  },
  {
    magnet:
      "https://sessionize.com/image/5578-400o400o2-BMT43t5kd2U1XstaNnM6Ax.jpg",
    filename: "Kent C.",
    token: "Dodds",
    notes: "@kentcdodds",
  },
  {
    magnet:
      "https://sessionize.com/image/c9d5-400o400o2-Sri5qnQmscaJXVB8m3VBgf.jpg",
    filename: "Nevi",
    token: "Shah",
    notes: "@nevikashah",
  },
  {
    magnet:
      "https://sessionize.com/image/2694-400o400o2-MYYTsnszbLKTzyqJV17w2q.png",
    filename: "Andrew",
    token: "Petersen",
  },
  {
    magnet:
      "https://sessionize.com/image/907a-400o400o2-9TM2CCmvrw6ttmJiTw4Lz8.jpg",
    filename: "Scott",
    token: "Smerchek",
    notes: "@smerchek",
  },
  {
    magnet:
      "https://sessionize.com/image/08be-400o400o2-WtYGFFR1ZUJHL9tKyVBNPV.jpg",
    filename: "Giovanni",
    token: "Benussi",
    notes: "@giovannibenussi",
  },
  {
    magnet:
      "https://sessionize.com/image/f814-400o400o2-n2ua5nM9qwZA2hiGdr1T7N.jpg",
    filename: "Igor",
    token: "Minar",
    notes: "@IgorMinar",
  },
  {
    magnet:
      "https://sessionize.com/image/fb82-400o400o2-LbvwhTVMrYLDdN3z4iEFMp.jpeg",
    filename: "Brandon",
    token: "Kish",
  },
  {
    magnet:
      "https://sessionize.com/image/fcda-400o400o2-XiYRtKK5Dvng5AeyC8PiUA.png",
    filename: "Arisa",
    token: "Fukuzaki",
    notes: "@arisa_dev",
  },
  {
    magnet:
      "https://sessionize.com/image/c8c3-400o400o2-PR5UsgApAVEADZRixV4H8e.jpeg",
    filename: "Alexandra",
    token: "Spalato",
    notes: "@alexadark",
  },
  {
    magnet:
      "https://sessionize.com/image/7594-400o400o2-hWtdCjbdFdLgE2vEXBJtyo.jpg",
    filename: "Cat",
    token: "Johnson",
  },
  {
    magnet:
      "https://sessionize.com/image/5636-400o400o2-TWgi8vELMFoB3hB9uPw62d.jpg",
    filename: "Ashley",
    token: "Narcisse",
    notes: "@_darkfadr",
  },
  {
    magnet:
      "https://sessionize.com/image/6aeb-400o400o2-Q5tAiuzKGgzSje9ZsK3Yu5.JPG",
    filename: "Edmund",
    token: "Hung",
    notes: "@_edmundhung",
  },
  {
    magnet:
      "https://sessionize.com/image/30f1-400o400o2-wJBdJ6sFayjKmJycYKoHSe.jpg",
    filename: "Clifford",
    token: "Fajardo",
    notes: "@cliffordfajard0",
  },
  {
    magnet:
      "https://sessionize.com/image/6faa-400o400o2-amseBRDkdg7wSK5tjsFDiG.jpg",
    filename: "Erick",
    token: "Tamayo",
    notes: "@ericktamayo",
  },
  {
    magnet:
      "https://sessionize.com/image/feba-400o400o2-R4GE7eqegJNFf3cQ567obs.jpg",
    filename: "Paul",
    token: "Bratslavsky",
    notes: "@codingthirty",
  },
  {
    magnet:
      "https://sessionize.com/image/c315-400o400o2-spjM5A6VVfVNnQsuwvX3DY.jpg",
    filename: "Pedro",
    token: "Cattori",
    notes: "@pcattori",
  },
  {
    magnet:
      "https://sessionize.com/image/eec1-400o400o2-HkvWKLFqecmFxLwqR9KMRw.jpg",
    filename: "Andre",
    token: "Landgraf",
    notes: "@AndreLandgraf94",
  },
  {
    magnet:
      "https://sessionize.com/image/c73a-400o400o2-4MTaTq6ftC15hqwtqUJmTC.jpg",
    filename: "Monica",
    token: "Powell",
    notes: "@indigitalcolor",
  },
  {
    magnet:
      "https://sessionize.com/image/cef7-400o400o2-KBZUydbjfkfGACQmjbHEvX.jpeg",
    filename: "Brian",
    token: "Lee",
    notes: "@brian_dlee",
  },
  {
    magnet:
      "https://sessionize.com/image/f83b-400o400o2-Pyw3chmeHMxGsNoj3nQmWU.jpg",
    filename: "Sean",
    token: "McQuaid",
    notes: "@SeanMcQuaidCode",
  },
  {
    magnet:
      "https://sessionize.com/image/a9fc-400o400o2-JHBnWZRoxp7QX74Hdac7AZ.jpg",
    filename: "Shane",
    token: "Walker",
    notes: "@swalker326",
  },
  {
    magnet:
      "https://sessionize.com/image/6644-400o400o2-aHnGHb5Pdu3D32MbfrnQbj.jpg",
    filename: "Jon",
    token: "Jensen",
    notes: "@jenseng",
  },
].forEach((contact) => {
  fakeContacts.create({
    ...contact,
    id: `${contact.filename.toLowerCase()}-${contact.token.toLocaleLowerCase()}`,
  });
});
