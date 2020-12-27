# @devserver/external

get all external dependencies from packages.json associated with directory.

**The dependencies considered as external are `dependencies | peerDependencies | optionalDependencies`**

```js
import { getExternal } from "@devserver/external";

const external = await getExternal();
```
