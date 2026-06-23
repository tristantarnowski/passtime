<script lang="ts">
    export class table_row {
        header: string;
        data?: (string | number)[];
    }

    export let objects: table_row[];
</script>

<table>
    <tbody>
        {#each objects as object}
            <tr>
                <th>{object.header}</th>
                {#if object.data}
                    {#each object.data as data}
                        <td>{data}</td>
                    {/each}
                {/if}
            </tr>
        {/each}
    </tbody>
</table>
