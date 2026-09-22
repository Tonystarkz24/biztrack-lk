using BizTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AgentWorkflow> AgentWorkflows => Set<AgentWorkflow>();
    public DbSet<AgentExecutionLog> AgentExecutionLogs => Set<AgentExecutionLog>();
    public DbSet<WorkflowApproval> WorkflowApprovals => Set<WorkflowApproval>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Products
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Sku).IsUnique();
            entity.HasIndex(p => p.Name);
            entity.HasIndex(p => p.Category);
        });

        // Sales
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasIndex(s => s.SoldAt);
            entity.HasMany(s => s.Items)
                  .WithOne(i => i.Sale)
                  .HasForeignKey(i => i.SaleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SaleItems
        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.HasOne(si => si.Product)
                  .WithMany()
                  .HasForeignKey(si => si.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(si => si.LineTotal)
                  .ValueGeneratedOnAddOrUpdate();
        });

        // Expenses
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasIndex(e => e.ExpenseDate);
            entity.HasIndex(e => e.Category);
        });

        // Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // AgentWorkflows
        modelBuilder.Entity<AgentWorkflow>(entity =>
        {
            entity.HasIndex(w => w.WorkflowCode).IsUnique();
            entity.HasMany(w => w.ExecutionLogs)
                  .WithOne(l => l.Workflow)
                  .HasForeignKey(l => l.WorkflowId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(w => w.Approvals)
                  .WithOne(a => a.Workflow)
                  .HasForeignKey(a => a.WorkflowId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
