import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usersAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface TeamMemberSelectorProps {
  selectedMembers: string[];
  onSelectionChange: (members: string[]) => void;
}

export function TeamMemberSelector({ selectedMembers, onSelectionChange }: TeamMemberSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersAPI.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleMember = (memberName: string) => {
    if (selectedMembers.includes(memberName)) {
      onSelectionChange(selectedMembers.filter(m => m !== memberName));
    } else {
      onSelectionChange([...selectedMembers, memberName]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Select team members...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandList>
              <CommandEmpty>No team member found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => {
                      toggleMember(user.name);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedMembers.includes(user.name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {user.name} ({user.email})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedMembers.map((member) => (
            <Badge key={member} variant="secondary" className="px-2 py-1">
              {member}
              <button
                type="button"
                onClick={() => toggleMember(member)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

