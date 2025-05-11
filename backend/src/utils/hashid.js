import Hashids from 'hashids';

const hashids = new Hashids(process.env.HASHID_SENHA, 8);

export const encodeId = (id) => hashids.encode(id);
export const decodeId = (hash) => {
    const [id] = hashids.decode(hash);
    return id ?? null;
};