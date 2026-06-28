const { Writable } = require('stream');

describe('cloudinaryUpload utility', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.CLOUDINARY_UPLOAD_FOLDER = 'safeguard/evidence';
  });

  afterEach(() => {
    delete process.env.CLOUDINARY_UPLOAD_FOLDER;
    jest.clearAllMocks();
  });

  it('uploads evidence with SafeGuard folder, tags, and context metadata', async () => {
    let receivedOptions;

    jest.doMock('../config/cloudinary', () => ({
      uploader: {
        upload_stream: jest.fn((options, callback) => {
          receivedOptions = options;

          return new Writable({
            write(_chunk, _encoding, next) {
              next();
            },
            final(next) {
              callback(null, {
                public_id: 'safeguard/evidence/test-file',
                url: 'http://res.cloudinary.com/demo/safeguard/evidence/test-file',
                secure_url: 'https://res.cloudinary.com/demo/safeguard/evidence/test-file',
              });
              next();
            },
          });
        }),
      },
    }));

    const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');

    const result = await uploadBufferToCloudinary(
      {
        buffer: Buffer.from('fake image'),
      },
      {
        resourceType: 'image',
      }
    );

    expect(result.public_id).toBe('safeguard/evidence/test-file');
    expect(receivedOptions).toEqual({
      context: {
        app: 'safeguard',
        project: 'safeguard',
        uploadType: 'evidence',
      },
      folder: 'safeguard/evidence',
      resource_type: 'image',
      tags: ['safeguard', 'evidence'],
    });
  });
});
