// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

// Making a keypair and getting the private key
const newPair = Keypair.generate();
console.log(newPair);

// paste your secret that is logged here
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    // paste your secret key array here
    [
        235, 142, 149, 229, 125, 166, 89, 58, 88, 38, 34,
        91, 1, 152, 114, 87, 136, 122, 88, 209, 10, 156,
        92, 162, 156, 92, 65, 42, 38, 254, 195, 210, 23,
        118, 251, 194, 107, 78, 130, 198, 195, 184, 244, 52,
        183, 112, 13, 94, 170, 166, 64, 179, 208, 241, 4,
        212, 8, 122, 150, 238, 79, 224, 58, 171
    ]
);
const DEMO_FROM_PUBLIC_KEY = new Uint8Array(

    [
        23, 118, 251, 194, 107, 78, 130, 198,
        195, 184, 244, 52, 183, 112, 13, 94,
        170, 166, 64, 179, 208, 241, 4, 212,
        8, 122, 150, 238, 79, 224, 58, 171
    ]
);
const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    var senderWallet = await getWalletBalance(from.publicKey);
    console.log(`Sender Wallet balance: ${senderWallet / LAMPORTS_PER_SOL} SOL`);
    var transferToReceiver = BigInt(senderWallet) / BigInt(2);

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: transferToReceiver
        })
    );

    var signature = await sendAndConfirmTransaction(connection, transaction, [from]);
    console.log('Signature is', signature);
    var receiver = await getWalletBalance(to.publicKey);
    console.log(`Receiver balance :   ${receiver / LAMPORTS_PER_SOL}  SOL`);

    async function getWalletBalance(thePublicKey) {
        try {
            // Connect to the Devnet
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const walletBalance = await connection.getBalance(new PublicKey(thePublicKey));
            return walletBalance;

        } catch (err) {
            console.log(err);
        }
    }
}

transferSol();