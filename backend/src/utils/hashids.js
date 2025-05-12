import Hashids from 'hashids';

const hashids = new Hashids(process.env.HASHID_SENHA, 8);

export const encodeId = (id) => hashids.encode(id);
export const decodeId = (hash) => {
    const decoded = hashids.decode(hash);
    if (decoded.length !== 1 || typeof decoded[0] !== 'number') {
        throw new Error('ID inválido');
    }
    return decoded[0];
};