import Input from "@mui/joy/Input";
import { useSearchIndex } from "../../lib/searchIndex";
import { Link, List, ListItem, ListItemButton } from "@mui/joy";
import { SearchResult } from "minisearch";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useUrlState } from "../../lib/hooks";
import { ExcelFileName } from "../../context/referenceBuilder";

function Search() {
  const { mod } = useParams();
  const index = useSearchIndex();

  const [term, setTerm] = useUrlState("term")
  
  let searchResults: SearchResult[] = [];
  if (term && term.length > 1) {
    searchResults = index.search(term).slice(0, 19);
  }
  return (
    <>
      <Input autoFocus size="lg" placeholder="Search here..." value={term || ""} onChange={ev => setTerm(ev.target.value)} />
      <List>
        {searchResults.map(result => (
          <ListItem key={result.id}>
            <ListItemButton>
              <Link component={RouterLink} to={`/${mod}/${result.file}/${result.id}`} overlay>
                <span className={classByFile(result.file)}>{result.text}</span>
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}

function classByFile(file: ExcelFileName) {
  switch (file) {
    case "uniqueitems":
      return "uni";
    case "setitems":
      return "set";
    case "magicprefix":
    case "magicsuffix":
      return "mag";
    case "armor":
    case "weapons":
    case "misc":
      return "nrm";
  }
  return "";
}

export default Search;