const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://127.0.0.1:9000',
    credentials: { accessKeyId: 'admin', secretAccessKey: 'password123' },
    forcePathStyle: true,
});

async function main() {
    try {
        await client.send(new CreateBucketCommand({ Bucket: 'chapkhane' }));
        console.log('Bucket "chapkhane" created successfully');
    } catch(err) {
        if (err.name === 'BucketAlreadyExists' || err.name === 'BucketAlreadyOwnedByYou') {
            console.log('Bucket already exists');
        } else {
            console.error('Error creating bucket:', err);
        }
    }
}
main();
