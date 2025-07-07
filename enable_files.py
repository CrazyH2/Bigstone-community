import os

def remove_disabled_extension(root_dir="."):
    count = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(".disabled"):
                old_path = os.path.join(dirpath, filename)
                new_filename = filename[:-9]  # remove ".disabled"
                new_path = os.path.join(dirpath, new_filename)

                # Avoid overwriting existing files
                if not os.path.exists(new_path):
                    os.rename(old_path, new_path)
                    print(f"Renamed: {old_path} -> {new_path}")
                    count += 1
                else:
                    print(f"Skipped (already exists): {new_path}")
    print(f"Done! Renamed {count} files.")

if __name__ == "__main__":
    remove_disabled_extension()
# Example usage:
# remove_disabled_extension("/path/to/your/directory")
# or just call remove_disabled_extension() to use the current directory
