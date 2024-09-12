import {run} from '../src/main';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {GitHub} from "@actions/github/lib/utils";

import {FILE_STATE, getFilesFromPR, publishComment} from 'actions-common';

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('actions-common');

describe('run', () => {
    const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
    const mockGetOctokit = github.getOctokit as jest.MockedFunction<typeof github.getOctokit>;
    const mockGetFilesFromPR = getFilesFromPR as jest.MockedFunction<typeof getFilesFromPR>;
    const mockPublishComment = publishComment as jest.MockedFunction<typeof publishComment>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('publishes comment with updated and deleted links', async () => {
        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'github-token':
                    return 'fake-token';
                case 'component-name':
                    return 'component';
                case 'site-url':
                    return 'http://example.com';
                default:
                    return '';
            }
        });

        const mockOctokit = {} as InstanceType<typeof GitHub>;
        mockGetOctokit.mockReturnValue(mockOctokit);

        mockGetFilesFromPR.mockResolvedValue([
            { status: FILE_STATE.MODIFIED, filename: 'modules/ROOT/pages/page1.adoc' },
            { status: FILE_STATE.REMOVED, filename: 'modules/ROOT/pages/page2.adoc' }
        ]);

        const mockContext = {
            payload: {
                pull_request: {
                    number: 1
                }
            }
        };
        // @ts-ignore
        github.context = mockContext as any;

        const mockComment = {
            data: {
                html_url: 'http://example.com/comment'
            }
        };
        mockPublishComment.mockResolvedValue(mockComment);

        await run();

        expect(mockPublishComment).toHaveBeenCalledWith(
            mockOctokit,
            '<!-- previewLinksCheck-->\n',
            expect.stringContaining('Check the pages that have been modified'),
            1
        );
    });

    it('sets failed status if an error occurs', async () => {
        mockGetInput.mockImplementation((name: string) => {
            switch (name) {
                case 'github-token':
                    return 'fake-token';
                case 'component-name':
                    return 'component';
                case 'site-url':
                    return 'http://example.com';
                default:
                    return '';
            }
        });

        const mockOctokit = {} as InstanceType<typeof GitHub>;
        mockGetOctokit.mockReturnValue(mockOctokit);

        mockGetFilesFromPR.mockRejectedValue(new Error('Failed to get files'));

        await run();

        expect(core.setFailed).toHaveBeenCalledWith('Failed to get files');
    });
});
