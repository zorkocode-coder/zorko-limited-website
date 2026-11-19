# Zorko Group blog agent

The agent runs in Google Apps Script from a team Google Sheet. It makes one model request per draft. The website is static, so approved articles go to a GitHub pull request. Once the article is merged, the next website build adds the article, blog index entry, and production sitemap entry.

## Set up the Google Sheet

1. Create a Google Sheet with trusted editors. Open **Extensions → Apps Script**, paste the contents of `blog-agent.gs` into `Code.gs`, and save. Reopen the Sheet to load the **Zorko Blog** menu, then select **Set up queue**.
2. Select **Set credentials** and enter an OpenAI API key and a model ID that supports Structured Outputs. Each operator's credentials go in their Apps Script user properties. Editors of a bound script can change its code, so keep edit access limited to trusted staff. Use only public facts and editorial notes in the queue.
3. For the website handoff, connect the website checkout to a GitHub repository that contains this build code. In Apps Script **Project Settings → Script properties**, set `GITHUB_REPO` to `owner/repository` and, if needed, `GITHUB_BASE_BRANCH` to the target branch. In **Set credentials**, enter a fine-grained GitHub token restricted to that repository with Contents and Pull requests read/write.

## Prepare and publish a post

1. Enter a topic, a primary keyword, search intent, source notes, and the related website page. The example row shows the source format. Use one entry per source with `title`, `url` and `notes`. Examples include franchise setup costs, food-business consultancy briefs, sales training, and employee benefits.
2. Select **Generate draft**. The article returns with a title, description, direct answer, sections, FAQs where useful, citation references and unresolved items. Review the full JSON in column F. Verify every company and employment claim against the source, make edits, and clear `reviewNotes` only after resolving each issue.
3. Select **Approve reviewed draft** and confirm. Then select **Open website pull request**. Changes to the draft or brief require a new approval. Merging and live deployment follow the site's release process.

The agent uses the source notes you provide. The approved article carries the source titles, links and citation references to the website. Keyword volumes and organic difficulty require data from a search provider. Apps Script, model availability and quotas apply to the connected account.
