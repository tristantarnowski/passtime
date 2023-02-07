<script lang="ts">
    export let objects: { header: string; data?: (string | number)[] }[];
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
