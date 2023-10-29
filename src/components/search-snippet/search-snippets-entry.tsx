import { List } from "@raycast/api";
import { useState, useMemo } from "react";
import { useDataFetch, fetchSnippets } from "../../lib/hooks/use-data-ops";
import { Snippet, Library, Label } from "../../lib/types/dto";
import { SNIPPETS_FILTER } from "../../lib/types/snippet-filters";
import InitError from "../init/init-error";
import { ItemActions } from "./item-actions";
import { ItemDetail } from "./item-detail";
import { SearchBarAccessory } from "./search-bar-accessory";



function SnippetItem({ snippet }: { snippet: Snippet }) {
    console.log("SnippetItem render!!!!")
    return (
        <List.Item
            title={snippet.title}
            actions={<ItemActions snippet={snippet} />}
            detail={<ItemDetail snippet={snippet} />}
        />
    );
}

export default function SearchSnippetsEntry() {
    const { isLoading: isLibLoading, data: libraries, error: loadLibErr } = useDataFetch<Library>('library');
    const { isLoading: isLabelLoading, data: labels, error: loadLabelErr } = useDataFetch<Label>('label');
    const { isLoading: isSnippetLoading, data: snippets, error: loadSnippetErr } = fetchSnippets();

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<SNIPPETS_FILTER>("all");
    const isLoading = isLabelLoading || isLibLoading || isSnippetLoading;
    const errMsg = function (loadLabelErr, loadLibErr, loadSnippetErr) {
        if (loadLabelErr !== undefined) {
            return ` # Something wrong
Some errors happened when fetching labels from database. 
Error details are as follows:
\`\`\`
${loadLabelErr instanceof Error ? loadLabelErr.stack : String(loadLabelErr)}
\`\`\`
`;
        }
        if (loadLibErr !== undefined) {
            return ` # Something wrong
Some errors happened when fetching librarys from database. 
Error details are as follows:
\`\`\`
${loadLibErr instanceof Error ? loadLibErr.stack : String(loadLibErr)}
\`\`\`
`;
        }
        if (loadSnippetErr !== undefined) {
            return ` # Something wrong
Some errors happened when fetching snippets from database. 
Error details are as follows:
\`\`\`
${loadSnippetErr instanceof Error ? loadSnippetErr.stack : String(loadSnippetErr)}
\`\`\`
`;
        }
        return null;
    }(loadLabelErr, loadLibErr, loadSnippetErr);

    const trimmedSearchQuery = searchQuery.trim().toLocaleLowerCase();
    const filteredSnippets = useMemo(() => {
        return snippets?.filter((snippet) => {
            if (trimmedSearchQuery.length === 0) {
                return true;
            }
            return (
                snippet.title.toLocaleLowerCase().includes(trimmedSearchQuery) ||
                snippet.content.toLocaleLowerCase().includes(trimmedSearchQuery) ||
                snippet.fileName.toLocaleLowerCase().includes(trimmedSearchQuery)
            );
        }).filter((snippet) => {
            if (filter.includes("library_")) {
                const uuid = filter.replace("library_", "");
                return snippet.library.uuid === uuid;
            } else if (filter.includes("label_")) {
                const uuid = filter.replace("label_", "");
                return snippet.labels.find(l => l.uuid == uuid) != undefined;
            } else {
                return true;
            }
        });
    }, [snippets, trimmedSearchQuery, filter]);

    return (
        errMsg ? <InitError errMarkdown={errMsg} /> :
            <List
                searchText={searchQuery}
                onSearchTextChange={setSearchQuery}
                isShowingDetail={true}
                isLoading={isLoading}
                searchBarPlaceholder="Search Snippets"
                searchBarAccessory={
                    <SearchBarAccessory labels={labels ? labels : []}
                        libraries={libraries ? libraries : []}
                        filter={filter} setFilter={setFilter}
                    />
                }
            >
                {(filteredSnippets ? filteredSnippets : []).map((snippet) =>
                    <SnippetItem key={snippet.uuid} snippet={snippet} />
                )}
            </List>
    );
}