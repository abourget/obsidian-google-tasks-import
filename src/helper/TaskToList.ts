import type { Task } from 'src/helper/types';

export const taskToList = (task: Task): string => {
    const elements = [
        `- [${task.status=="completed"? "x": " "}]`,
    ]
    //elements.push(`[gt](https://tasks.google.com#id=${task.id})`)
    elements.push(task.title)
    if (task.links && task.links.length > 0) {
        for (const link of task.links) {
            elements.push(`[${link.description}](${link.link})`);
        }
    }
    if (task.due) {
        const date = window.moment.utc(task.due).local().format("YYYY-MM-DD");
        elements.push(`(@${date})`)
    }
    elements.push("📬")
    if (task.notes) {
        const indented = task.notes.replaceAll("\n", "\n\t")
        elements.push(`\n\t${indented}`)
    }

    return elements.join(" ") + "\n"
}